const axios = require('axios');

async function findMissing() {
  try {
    const res = await axios.get('http://localhost:5000/leads');
    const leads = res.data;
    
    const missing = leads.filter(l => !l.PlaceID || l.PlaceID === '');
    
    console.log(`Found ${missing.length} leads with missing PlaceID\n`);
    
    if (missing.length > 0) {
      console.log('Sample lead with missing PlaceID:');
      const sample = missing[0];
      console.log('BusinessName:', sample.BusinessName);
      console.log('Category:', sample.Category);
      console.log('City:', sample.City);
      console.log('Phone:', sample.Phone);
      console.log('\nAll keys in this lead:');
      Object.keys(sample).forEach(key => {
        if (key.toLowerCase().includes('place') || key.toLowerCase().includes('id')) {
          console.log(`  ${key}: "${sample[key]}"`);
        }
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

findMissing();
