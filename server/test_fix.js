const { google } = require('googleapis');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

async function testFinal() {
    console.log('--- TEST FINAL ---');
    
    // READ THE RAW FILE to avoid dotenv parser issues
    const envRaw = fs.readFileSync('.env', 'utf8');
    const keyMatch = envRaw.match(/GOOGLE_PRIVATE_KEY="([\s\S]*?)"/);
    
    if (!keyMatch) {
       console.error('Could not find key in .env using regex');
       return;
    }

    const rawKey = keyMatch[1];
    const formattedKey = rawKey.replace(/\\n/g, '\n');

    console.log('Cleaned Key starts with:', formattedKey.substring(0, 30));

    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
    const auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        null,
        formattedKey,
        SCOPES
    );

    try {
        const sheets = google.sheets({ version: 'v4', auth });
        const res = await sheets.spreadsheets.get({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        });
        console.log('✅ FIXED! Success connecting to:', res.data.properties.title);
    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response) console.error(JSON.stringify(err.response.data, null, 2));
    }
}
testFinal();
