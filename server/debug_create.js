const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

async function debugCreate() {
    console.log('--- DEBUG CREATE ---');
    const SCOPES = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
    ];

    // MANUALLY CLEAN THE KEY
    let key = process.env.GOOGLE_PRIVATE_KEY;
    if (key.startsWith('"') && key.endsWith('"')) {
        key = key.substring(1, key.length - 1);
    }
    const formattedKey = key.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        null,
        formattedKey,
        SCOPES
    );

    try {
        const sheets = google.sheets({ version: 'v4', auth });
        console.log('Attempting to create sheet...');
        const res = await sheets.spreadsheets.create({
            resource: { properties: { title: 'LeadMagnet CRM Test' } }
        });
        console.log('✅ Created! ID:', res.data.spreadsheetId);
        console.log('✅ URL:', res.data.spreadsheetUrl);
    } catch (err) {
        console.error('❌ Failed');
        if (err.response && err.response.data) {
            console.error('JSON Error:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Error:', err.message);
        }
    }
}
debugCreate();
