const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

async function testIdentity() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT(email, null, key, ['https://www.googleapis.com/auth/cloud-platform']);
  
  try {
    const oauth2 = google.oauth2({ version: 'v2', auth });
    const res = await oauth2.userinfo.get();
    console.log('Authenticated as:', res.data.email);
  } catch (err) {
    console.log('Could not get userinfo, but that is expected if scope is limited.');
    console.log('Error:', err.message);
  }

  // Try to list spreadsheets
  const sheets = google.sheets({ version: 'v4', auth });
  try {
     console.log('Attempting to get spreadsheet:', process.env.GOOGLE_SHEETS_ID);
     const res = await sheets.spreadsheets.get({ spreadsheetId: process.env.GOOGLE_SHEETS_ID });
     console.log('Success! Title:', res.data.properties.title);
  } catch (err) {
     console.log('Failed to get spreadsheet.');
     if (err.response) console.log('Data:', JSON.stringify(err.response.data, null, 2));
  }
}
testIdentity();
