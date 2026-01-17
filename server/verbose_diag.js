const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

async function testVerbose() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const sheetId = process.env.GOOGLE_SHEETS_ID;

  const auth = new google.auth.JWT(email, null, key, ['https://www.googleapis.com/auth/spreadsheets']);
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const res = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    console.log('SUCCESS');
  } catch (err) {
    if (err.response) {
      console.log('--- ERROR RESPONSE DATA ---');
      console.log(JSON.stringify(err.response.data, null, 2));
    } else {
      console.log('--- ERROR MESSAGE ---');
      console.log(err.message);
    }
  }
}
testVerbose();
