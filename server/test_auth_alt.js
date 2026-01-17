const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

async function testFinal() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  try {
    const res = await sheets.spreadsheets.get({ spreadsheetId: process.env.GOOGLE_SHEETS_ID });
    console.log('✅ SUCCESS! Title:', res.data.properties.title);
  } catch (err) {
    console.log('❌ FAILED');
    if (err.response) console.log(JSON.stringify(err.response.data, null, 2));
    else console.log(err.message);
  }
}
testFinal();
