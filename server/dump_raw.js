const { google } = require('googleapis');
require('dotenv').config();

async function dumpRaw() {
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
    const data = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:O10`,
    });
    console.log(JSON.stringify(data.data.values, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}
dumpRaw();
