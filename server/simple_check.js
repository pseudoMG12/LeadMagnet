const axios = require('axios');

async function simpleCheck() {
  try {
    const res = await axios.get('http://localhost:5000/leads');
    const leads = res.data;
    
    const first = leads[0];
    console.log('PlaceID value:', first.PlaceID);
    console.log('PlaceID type:', typeof first.PlaceID);
    console.log('PlaceID empty?', first.PlaceID === '');
    console.log('PlaceID undefined?', first.PlaceID === undefined);
    
    const missing = leads.filter(l => !l.PlaceID || l.PlaceID === '');
    console.log('Missing count:', missing.length, '/', leads.length);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

simpleCheck();
