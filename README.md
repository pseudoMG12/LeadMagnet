# LeadMagnet: Google Maps Scraper + Sheets CRM

A powerful, Sheets-backed CRM that scrapes business leads and prioritizes human follow-up.

## Setup

### 1. Google Cloud Setup
- Create a project in [Google Cloud Console](https://console.cloud.google.com/).
- Enable **Google Places API** and **Google Sheets API**.
- Create a **Service Account** and download the JSON key.
- Create a new Google Sheet and **Share** it with the service account email (with Editor permissions).

### 2. Environment Variables
Create a `.env` file in the `server` directory based on `.env.example`:
```env
PORT=5000
GOOGLE_MAPS_API_KEY=your_key
GOOGLE_SHEETS_ID=your_sheet_id_from_url
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Installation
```powershell
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Running the App
Open two terminals:

**Terminal 1 (Server):**
```powershell
cd server
node index.js
```

**Terminal 2 (Frontend):**
```powershell
cd client
npm run dev
```

## Features
- **Scraper:** Automatically stops at ~$190 usage to keep it within free limits.
- **Deduplication:** Strictly enforced by Google `place_id`.
- **Sheets-as-DB:** No local database. Bidirectional sync with Google Sheets.
- **Card CRM:** High-performance card UI with inline editing.
- **Visual Intelligence:**
  - **Yellow:** Highlighted/Pinned leads.
  - **Green:** Leads with existing remarks.
  - **Blue:** Leads updated within the last 24 hours.
- **Strict Ordering:** Highlighted first, then sorted by recency.
