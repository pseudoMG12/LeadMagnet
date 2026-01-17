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
    const response = await axios.get(url, { timeout: 5000, validateStatus: false });
    if (response.status >= 400) return 'broken';
    
    // Check for "non-functional" - simplified heuristic
    // If length is very small or it looks like a parked page
    const body = String(response.data).toLowerCase();
    if (body.length < 500 || body.includes('parked') || body.includes('buy this domain')) {
      return 'non-functional';
    }
    
    return 'working';
  } catch (error) {
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

    try {
      // 1. Text Search
      const searchRes = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params: {
          query,
          key: GOOGLE_MAPS_API_KEY
        }
      });
      currentUsageUSD += PRICING.TEXT_SEARCH;

      const results = searchRes.data.results || [];
      
      for (const place of results) {
        if (currentUsageUSD >= USAGE_LIMIT_USD) break;
        if (existingPlaceIds.has(place.place_id)) continue;

        // 2. Place Details
        const detailsRes = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
          params: {
            place_id: place.place_id,
            fields: 'name,formatted_phone_number,website,url,place_id',
            key: GOOGLE_MAPS_API_KEY
          }
        });
        currentUsageUSD += PRICING.PLACE_DETAILS;

        const details = detailsRes.data.result;
        if (!details) continue;

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
        }
      }
    } catch (error) {
      console.error(`Error searching for ${category}:`, error.message);
    }
  }

  return allNewLeads;
}

module.exports = {
  scrapeLeads,
  getUsage: () => currentUsageUSD
};
