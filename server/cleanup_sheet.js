const { google } = require('googleapis');
require('dotenv').config();

const SCHEMA = [
  'Business Name', 'Place ID', 'City', 'Category', 'Phone', 'Website', 
  'Website Status', 'Google Maps Link', 'Retrieved Date', 'Remarks', 
  'Highlighted', 'Last Updated', 'Call History', 'Reminder Date', 'Reminder Remark'
];

async function cleanupAndReorder() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  try {
    const res = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetName = res.data.sheets[0].properties.title;
    
    // 1. Get all data
    const data = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:O`,
    });

    const rows = data.data.values || [];
    if (rows.length === 0) {
        console.log('Sheet is empty.');
        return;
    }

    const header = rows[0];
    const originalBody = rows.slice(1);
    
    // 2. Identify indices based on ORIGINAL layout (A: Place ID, B: Business Name)
    // We assume the mess up was that A was ID and B was Name.
    const newRows = originalBody
      .filter(row => {
        // Look for "Sanket" in all columns
        const isSanket = row.some(cell => String(cell).toLowerCase().includes('sanket'));
        if (isSanket) console.log(`Removing row: ${row.join(', ')}`);
        return !isSanket;
      })
      .map(row => {
        // Swap Col 0 (ID) and Col 1 (Name)
        const id = row[0] || '';
        const name = row[1] || '';
        const rest = row.slice(2);
        return [name, id, ...rest];
      });

    // 3. Clear the sheet and update with new data
    await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${sheetName}!A:O`,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:O${newRows.length + 1}`,
      valueInputOption: 'RAW',
      resource: { values: [SCHEMA, ...newRows] },
    });

    console.log('✅ Cleanup complete: Removed Sanket and reordered columns (Name first).');
  } catch (err) {
    console.error('Failed to cleanup:', err.message);
  }
}

cleanupAndReorder();
