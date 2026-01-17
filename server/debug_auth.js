const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

async function debugAuth() {
    console.log('--- DEBUG AUTH ---');
    console.log('Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log('Sheet ID:', process.env.GOOGLE_SHEETS_ID);
    
    const SCOPES = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly'
    ];

    const auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        null,
        process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        SCOPES
    );

    try {
        console.log('Attempting to fetch sheet metadata...');
        const sheets = google.sheets({ version: 'v4', auth });
        const res = await sheets.spreadsheets.get({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        });
        console.log('✅ SUCCESS! Sheet title:', res.data.properties.title);
    } catch (err) {
        console.error('❌ FAILED');
        if (err.response && err.response.data) {
            console.error('API Error details:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Error message:', err.message);
        }
    }
}

debugAuth();
