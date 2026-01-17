const { initializeSheet, getAllLeads } = require('./sheets');

async function test() {
  console.log('--- Testing Google Sheets Connection ---');
  try {
    console.log('Attempting to initialize sheet (check headers)...');
    await initializeSheet();
    console.log('Successfully initialized/verified headers.');

    console.log('Attempting to fetch all leads...');
    const leads = await getAllLeads();
    console.log(`Successfully fetched ${leads.length} leads.`);
    
    if (leads.length > 0) {
      console.log('First lead sample:', leads[0]);
    }
    
    console.log('--- Test Passed! ---');
  } catch (error) {
    console.error('--- Test Failed ---');
    console.error('Error Message:', error.message);
    if (error.response) {
      console.error('Error Data:', error.response.data);
    }
  }
}

test();
