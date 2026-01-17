const axios = require('axios');

async function checkLeads() {
  try {
    const res = await axios.get('http://localhost:5000/leads');
    const leads = res.data;
    console.log(`Total Leads: ${leads.length}`);
    if (leads.length > 0) {
      console.log('First Lead:', JSON.stringify(leads[0], null, 2));
      console.log('PlaceID of First Lead:', `"${leads[0].PlaceID}"`);
    } else {
        console.log("No leads returned from API.");
    }
    
    // Check for any leads with missing PlaceID
    const missingId = leads.filter(l => !l.PlaceID);
    console.log(`Leads with missing PlaceID: ${missingId.length}`);
    if (missingId.length > 0) {
        console.log('Sample missing ID lead:', JSON.stringify(missingId[0], null, 2));
    }

  } catch (error) {
    console.error('Error fetching leads:', error.message);
  }
}

checkLeads();
