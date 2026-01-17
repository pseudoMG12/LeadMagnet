const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

async function listFiles() {
    const auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        null,
        process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        SCOPES
    );

    const drive = google.drive({ version: 'v3', auth });
    try {
        console.log('Listing files accessible by service account...');
        const res = await drive.files.list({
            pageSize: 10,
            fields: 'files(id, name)',
        });
        const files = res.data.files;
        if (files.length) {
            console.log('Files:');
            files.forEach((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        } else {
            console.log('No files found.');
        }
    } catch (err) {
        console.error('Error listing files:', err.message);
        if (err.response) console.error(JSON.stringify(err.response.data, null, 2));
    }
}

listFiles();
