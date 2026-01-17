const axios = require('axios');

async function checkApi() {
    try {
        const res = await axios.get('http://localhost:5000/leads');
        console.log('Total Leads:', res.data.length);
        if (res.data.length > 0) {
            const l = res.data[0];
            console.log('Mapping verification for first lead:');
            console.log('BusinessName:', l.BusinessName);
            console.log('Phone:', l.Phone);
            console.log('City:', l.City);
            console.log('Category:', l.Category);
            console.log('Full Object:', JSON.stringify(l, null, 2));
        }
    } catch (err) {
        console.error('API Error:', err.message);
    }
}
checkApi();
