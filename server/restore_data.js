const { google } = require('googleapis');
require('dotenv').config();

const SCHEMA = [
  'Lead Name', 'Phone Number', 'Telecaller', 'Business / City', 'Last Call Date', 
  'Call Status', 'Outcome', 'Next Follow-up Date', 'Attempt Count', 'Notes', 
  'Place ID', 'Category', 'Website', 'Website Status', 'Google Maps Link', 
  'Retrieved Date', 'Highlighted', 'Call History'
];

const DATA_TO_RESTORE = [
  ["Studio Nitya", "9028348922", "Sanket", "Pune", "2026-01-09", "Connected", "Planning to do next 6 month. Need to share details", "", "1", "", "manual-1", "Restored", "", "", "", "2026-01-09", "FALSE", "[]"],
  ["Upscale interiors", "9096300658", "Sanket", "Pune", "2026-01-09", "Connected", "Not Planning", "", "1", "", "manual-2", "Restored", "", "", "", "2026-01-09", "FALSE", "[]"],
  ["Droplets Design Studio", "9067077099", "Sanket", "Pune", "2026-01-09", "Connected", "Planning. Need to share details", "Next Week", "1", "Out of town now gonna connect.", "manual-3", "Restored", "", "", "", "2026-01-09", "FALSE", "[]"]
];

async function restore() {
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
    
    await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${sheetName}!A:R`,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:R${DATA_TO_RESTORE.length + 1}`,
      valueInputOption: 'RAW',
      resource: { values: [SCHEMA, ...DATA_TO_RESTORE] },
    });

    console.log('✅ Restoration complete. Schema and Data are back in sync.');
  } catch (err) {
    console.error('Failed to restore:', err.message);
  }
}

restore();
