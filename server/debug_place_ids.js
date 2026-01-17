const axios = require('axios');

async function debugPlaceIds() {
  try {
    const res = await axios.get('http://localhost:5000/leads');
    const leads = res.data;
    
    console.log(`\n=== PLACE ID DEBUG ===`);
    console.log(`Total Leads: ${leads.length}\n`);
    
    // Check first 5 leads
    leads.slice(0, 5).forEach((lead, i) => {
      console.log(`Lead ${i + 1}:`);
      console.log(`  BusinessName: "${lead.BusinessName}"`);
      console.log(`  PlaceID: "${lead.PlaceID}"`);
      console.log(`  Raw Keys:`, Object.keys(lead).filter(k => k.toLowerCase().includes('place')));
      console.log('');
    });
    
    // Count missing PlaceIDs
    const missing = leads.filter(l => !l.PlaceID || l.PlaceID === '');
    console.log(`Leads with missing PlaceID: ${missing.length}`);
    
    if (missing.length > 0) {
      console.log('\nFirst lead with missing PlaceID:');
      console.log(JSON.stringify(missing[0], null, 2));
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugPlaceIds();
