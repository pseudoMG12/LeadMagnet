const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

async function debugAuth() {
    console.log('--- DEBUG AUTH ---');
    
    // Test writing a single value
    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
    const auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        null,
        process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        SCOPES
    );

    try {
        const sheets = google.sheets({ version: 'v4', auth });
        
        console.log('Testing create sheet (independent of permissions on existing ones)...');
        const newSheet = await sheets.spreadsheets.create({
            resource: { properties: { title: 'Test from Bot' } }
        });
        console.log('✅ Success! Bot created its own sheet:', newSheet.data.spreadsheetId);
        console.log('This proves credentials are correct.');
        
    } catch (err) {
        console.error('❌ Failed');
        if (err.response && err.response.data) {
            console.error(JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err.message);
        }
    }
}
debugAuth();
