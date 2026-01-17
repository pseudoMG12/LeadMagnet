const { getAllLeads, updateLead } = require('./sheets');

async function testUpdate() {
  try {
    console.log('Fetching leads...');
    const leads = await getAllLeads();
    if (leads.length === 0) {
      console.log('No leads found.');
      return;
    }

    const target = leads[0];
    console.log(`Targeting First Lead: ${target.BusinessName} (ID: ${target.PlaceID})`);
    
    // Test payload simulating a log update
    const dummyHistory = JSON.stringify([{ date: new Date().toISOString(), note: "TEST LOG ENTRY " + Date.now() }]);
    
    console.log('Attempting to update Call History and Notes...');
    await updateLead(target.PlaceID, {
       callHistory: dummyHistory,
       reminderRemark: "TEST NOTE " + Date.now(),
       remarks: "TEST OUTCOME " + Date.now()
    });

    console.log('Update function completed without error.');
    
    // Verify
    console.log('Verifying update...');
    const newLeads = await getAllLeads();
    const updated = newLeads.find(l => l.PlaceID === target.PlaceID);
    
    console.log('Updated History:', updated.CallHistory);
    console.log('Updated Notes:', updated.ReminderRemark);
    console.log('Updated Outcome:', updated.Remarks);

  } catch (error) {
    console.error('TEST FAILED:', error);
  }
}

testUpdate();
