const { google } = require('googleapis');
require('dotenv').config();

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

async function debugSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A1:R5', // Read first 5 rows including header
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    console.log('HEADERS (Row 1):');
    console.log(JSON.stringify(rows[0], null, 2));

    console.log('\nROW 2 (First Data Row):');
    if (rows.length > 1) {
        console.log(JSON.stringify(rows[1], null, 2));
        console.log('Row 2 Length:', rows[1].length);
        console.log('Value at Index 10 (K / Place ID):', `"${rows[1][10]}"`);
    } else {
        console.log('No data rows.');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugSheet();
