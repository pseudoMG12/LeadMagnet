const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const USAGE_LIMIT_USD = 190;
let currentUsageUSD = 0;

// Pricing: Text Search = $0.032, Place Details = $0.017 (basic) + details costs
// Let's approximate: Text Search = $0.04, Details = $0.025
const PRICING = {
  TEXT_SEARCH: 0.04,
  PLACE_DETAILS: 0.025
};

async function classifyWebsite(url) {
  if (!url) return 'missing';
  
  try {
    const response = await axios.get(url, { 
      timeout: 10000, // Increased timeout slightly
      validateStatus: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    // 1. Definite Errors (Site is down or doesn't exist)
    if (response.status === 404 || response.status >= 500) {
      return 'broken';
    }

    // 2. Protected/Blocking Scrapers (Site is likely online, just blocking axios)
    // 403: Forbidden, 401: Unauthorized, 406: Not Acceptable, 429: Too Many Requests
    if ([403, 401, 406, 429].includes(response.status)) {
      return 'working'; 
    }

    // 3. Other Client Errors (400, 402, etc) - Treat as broken? 
    // Let's be conservative: if it's not 404/403, it might be broken.
    if (response.status >= 400) {
       return 'broken';
    }
    
    // Check for "non-functional" - simplified heuristic
    // If length is very small or it looks like a parked page
    const body = String(response.data).toLowerCase();
    if (body.length < 500 || body.includes('parked') || body.includes('buy this domain')) {
      return 'non-functional';
    }
    
    return 'working';
  } catch (error) {
    // Distinguish between network errors (site down) vs connection resets
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return 'broken';
    }
    // If it's some other weird network error, assume broken
    return 'broken';
  }
}

async function scrapeLeads(city, categories, existingPlaceIds) {
  const allNewLeads = [];
  
  for (const category of categories) {
    if (currentUsageUSD >= USAGE_LIMIT_USD) {
      console.log('Usage limit reached. Stopping scraper.');
      break;
    }

    const query = `${category} in ${city}`;
    console.log(`Searching for: ${query}`);

    let nextPageToken = null;
    let categoryCount = 0;
    const MAX_PER_CATEGORY = 30;

    do {
      try {
        // 1. Text Search
        const searchParams = {
          query,
          key: GOOGLE_MAPS_API_KEY
        };
        if (nextPageToken) searchParams.pagetoken = nextPageToken;

        const searchRes = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
          params: searchParams
        });
        currentUsageUSD += PRICING.TEXT_SEARCH;

        const results = searchRes.data.results || [];
        nextPageToken = searchRes.data.next_page_token;
        
        for (const place of results) {
          if (currentUsageUSD >= USAGE_LIMIT_USD) break;
          if (categoryCount >= MAX_PER_CATEGORY) break;
          if (existingPlaceIds.has(place.place_id)) continue;

          // 2. Place Details
          const detailsRes = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
              place_id: place.place_id,
              fields: 'name,formatted_phone_number,website,url,place_id,reviews',
              key: GOOGLE_MAPS_API_KEY
            }
          });
          currentUsageUSD += PRICING.PLACE_DETAILS;

          const details = detailsRes.data.result;
          if (!details) continue;

          // Skip if no reviews
          if (!details.reviews || details.reviews.length === 0) {
            console.log(`Skipping ${details.name}: No reviews found.`);
            continue;
          }

          // Find the latest review timestamp
          const latestReviewTime = Math.max(...details.reviews.map(r => r.time));
          const oneYearAgo = Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60);

          // Skip if latest review is older than a year
          if (latestReviewTime < oneYearAgo) {
            console.log(`Skipping ${details.name}: Latest review is too old (${new Date(latestReviewTime * 1000).toLocaleDateString()}).`);
            continue;
          }

          const websiteStatus = await classifyWebsite(details.website);
          
          // Only keep non-working websites as per requirements
          if (websiteStatus !== 'working') {
            allNewLeads.push({
              placeId: details.place_id,
              name: details.name,
              city,
              category,
              phone: details.formatted_phone_number || '',
              website: details.website || '',
              websiteStatus,
              mapsUrl: details.url,
              retrievedDate: new Date().toISOString()
            });
            categoryCount++;
          }
        }

        // Wait a bit if there's a next page (required by Google API for token to become active)
        if (nextPageToken && categoryCount < MAX_PER_CATEGORY) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error(`Error searching for ${category}:`, error.message);
        break;
      }
    } while (nextPageToken && categoryCount < MAX_PER_CATEGORY && currentUsageUSD < USAGE_LIMIT_USD);
  }

  return allNewLeads;
}

module.exports = {
  scrapeLeads,
  getUsage: () => currentUsageUSD
};
