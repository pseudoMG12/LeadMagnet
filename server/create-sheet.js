const { google } = require('googleapis');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];

async function createSheet() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.error('❌ Error: Missing credentials in .env file.');
    console.log('Please ensure GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY are set.');
    return;
  }

  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    SCOPES
  );

  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });

  try {
    console.log('⏳ Creating new Spreadsheet...');
    
    const resource = {
      properties: {
        title: `LeadMagnet CRM - ${new Date().toLocaleDateString()}`,
      },
    };

    const spreadsheet = await sheets.spreadsheets.create({
      resource,
      fields: 'spreadsheetId,spreadsheetUrl',
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    const spreadsheetUrl = spreadsheet.data.spreadsheetUrl;

    console.log(`✅ Spreadsheet created!`);
    console.log(`🔗 URL: ${spreadsheetUrl}`);
    console.log(`🆔 ID: ${spreadsheetId}`);

    // Initialize Headers
    const SCHEMA = [
      'Place ID',
      'Business Name',
      'City',
      'Category',
      'Phone',
      'Website',
      'Website Status',
      'Google Maps Link',
      'Retrieved Date',
      'Remarks',
      'Highlighted',
      'Last Updated',
      'Call History',
      'Reminder Date',
      'Reminder Remark'
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1:O1',
      valueInputOption: 'RAW',
      resource: { values: [SCHEMA] },
    });

    console.log('✅ Headers initialized.');

    // Give permission to anyone with the link (optional/careful)
    // Or just remind the user to share it with their own email
    console.log('\n👉 IMPORTANT: Since this was created by a Service Account, you must share it with your own email to see it.');
    console.log(`Service Account Email: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`);

    // Update .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('GOOGLE_SHEETS_ID=')) {
      envContent = envContent.replace(/GOOGLE_SHEETS_ID=.*/, `GOOGLE_SHEETS_ID=${spreadsheetId}`);
    } else {
      envContent += `\nGOOGLE_SHEETS_ID=${spreadsheetId}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file updated with new GOOGLE_SHEETS_ID.');

  } catch (error) {
    console.error('❌ Failed to create sheet:', error.message);
  }
}

createSheet();
