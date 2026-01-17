const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

async function test() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const sheetId = process.env.GOOGLE_SHEETS_ID;

  console.log('Testing with Email:', email);
  console.log('Testing with Sheet ID:', sheetId);

  const auth = new google.auth.JWT(email, null, key, ['https://www.googleapis.com/auth/spreadsheets']);
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const res = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    console.log('SUCCESS! Title:', res.data.properties.title);
  } catch (err) {
    console.log('ERROR STATUS:', err.code || err.status);
    if (err.response && err.response.data) {
      console.log('ERROR DATA:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.log('ERROR MESSAGE:', err.message);
    }
  }
}
test();
