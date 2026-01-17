const { initializeSheet } = require('./sheets');

async function fix() {
  console.log('--- Force Synchronizing Google Sheet Schema ---');
  try {
    await initializeSheet();
    console.log('--- Done! Check your Google Sheet now. ---');
    console.log('The headers (A to O) have been set to:');
    console.log('A: Place ID, B: Business Name, C: City, D: Category, E: Phone, F: Website, G: Website Status, H: Google Maps Link, I: Retrieved Date, J: Remarks, K: Highlighted, L: Last Updated, M: Call History, N: Reminder Date, O: Reminder Remark');
  } catch (err) {
    console.error('Failed to sync:', err.message);
  }
}

fix();
