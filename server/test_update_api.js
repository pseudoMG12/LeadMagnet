const axios = require('axios');

async function testUpdate() {
    try {
        console.log('Fetching leads...');
        const leadsRes = await axios.get('http://localhost:5000/leads');
        if (leadsRes.data.length === 0) {
            console.log('No leads to update');
            return;
        }
        
        const firstLead = leadsRes.data[0];
        console.log(`Updating lead: ${firstLead.BusinessName} (${firstLead.PlaceID})`);
        
        const updateRes = await axios.patch(`http://localhost:5000/lead/${firstLead.PlaceID}`, {
            remarks: 'Updated remark ' + new Date().toLocaleTimeString(),
            name: firstLead.BusinessName + ' (Updated)'
        });
        
        console.log('Update result:', updateRes.data);
    } catch (err) {
        console.error('Update failed:', err.response ? err.response.data : err.message);
    }
}

testUpdate();
