const { google } = require('googleapis');
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];

// Helper to get auth correctly
async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });
  return await auth.getClient();
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

// NEW SCHEMA MAPPING TO USER'S PREFERRED COLUMNS (A-J) + TECHNICAL COLUMNS (K-T)
const SCHEMA = [
  'Lead Name',           // A (Business Name)
  'Phone Number',        // B (Phone)
  'Telecaller',          // C
  'Business / City',     // D (City)
  'Last Call Date',      // E (Last Updated)
  'Call Status',         // F
  'Outcome',             // G (Remarks)
  'Next Follow-up Date', // H (Reminder Date)
  'Attempt Count',       // I
  'Notes',               // J (Reminder Remark)
  'Place ID',            // K (Technical)
  'Category',            // L (Technical)
  'Website',             // M (Technical)
  'Website Status',      // N (Technical)
  'Google Maps Link',    // O (Technical)
  'Retrieved Date',      // P (Technical)
  'Highlighted',         // Q (Technical)
  'Call History',        // R (Technical - JSON)
  'Instagram',           // S (Technical)
  'Color'                // T (Technical - Card Color)
];

async function initializeSheet() {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const res = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    const sheetName = res.data.sheets[0].properties.title;

    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1:T1`,
    });

    const currentHeaders = headerRes.data.values ? headerRes.data.values[0] : [];
    const headersMatch = currentHeaders.length === SCHEMA.length && 
                         SCHEMA.every((h, i) => h === currentHeaders[i]);

    if (!headersMatch) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1:T1`,
        valueInputOption: 'RAW',
        resource: { values: [SCHEMA] },
      });
      console.log('✅ Sheet schema updated to Lead Contact Layout.');
    }
  } catch (error) {
    console.error('Error initializing sheet:', error.message);
  }
}

async function getAllLeads() {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const sheetName = res.data.sheets[0].properties.title;

  const data = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:T`,
  });

  const rows = data.data.values;
  if (!rows || rows.length <= 1) return [];

  const headers = rows[0];
  return rows.slice(1).map((row, index) => {
    const lead = {};
    headers.forEach((h, i) => {
      const key = h.replace(/[^a-zA-Z0-9]/g, '');
      lead[key] = row[i] || '';
    });
    
    // Generate fallback PlaceID for manually-added leads
    const placeId = lead.PlaceID || `manual-${lead.LeadName?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || index}`;
    
    // Normalize keys for legacy app usage
    return {
      ...lead,
      PlaceID: placeId,
      BusinessName: lead.LeadName || '',
      City: lead.BusinessCity || '', // Mapped from "Business / City"
      Phone: lead.PhoneNumber || '',
      Remarks: lead.Outcome || '',
      Highlighted: lead.Highlighted || 'FALSE',
      LastUpdated: lead.LastCallDate || '',
      ReminderDate: lead.NextFollowupDate || '',
      ReminderRemark: lead.Notes || '',
      CallHistory: lead.CallHistory || '[]',
      Category: lead.Category || 'General',
      Instagram: lead.Instagram || '',
      Color: lead.Color || '',
      GoogleMapsLink: lead.GoogleMapsLink || (lead.LeadName ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.LeadName + ' ' + (lead.BusinessCity || ''))}` : '')
    };
  });
}

async function updateLead(placeId, updates) {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  const allLeads = await getAllLeads();
  const rowIndex = allLeads.findIndex(l => l.PlaceID === placeId);
  
  if (rowIndex === -1) throw new Error('Lead not found');

  const actualRowIndex = rowIndex + 2;
  const res = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const sheetName = res.data.sheets[0].properties.title;

  const updatePromises = [];

  // Lead Name -> Col A (1st)
  if (updates.name !== undefined) {
    updatePromises.push(sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A${actualRowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[updates.name]] },
    }));
  }

  // Phone Number -> Col B (2nd)
  if (updates.phone !== undefined) {
    updatePromises.push(sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!B${actualRowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[updates.phone]] },
    }));
  }

  // Business / City -> Col D (4th)
  if (updates.city !== undefined) {
    updatePromises.push(sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!D${actualRowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[updates.city]] },
    }));
  }

  // Telecaller -> Col C (3rd)
  if (updates.telecaller !== undefined) {
    updatePromises.push(sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!C${actualRowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[updates.telecaller]] },
    }));
  }

  // Call Status -> Col F (6th)
  if (updates.callStatus !== undefined) {
    updatePromises.push(sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!F${actualRowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[updates.callStatus]] },
    }));
  }

  // Outcome (Remarks) -> Col G (7th)
  if (updates.remarks !== undefined) {
    updatePromises.push(sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!G${actualRowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[updates.remarks]] },
    }));
  }

  // Highlighted -> Col Q (17th)
  if (updates.highlighted !== undefined) {
    updatePromises.push(sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!Q${actualRowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[updates.highlighted ? 'TRUE' : 'FALSE']] },
    }));
  }

  // Call History -> Col R (18th)
  if (updates.callHistory !== undefined) {
    const history = JSON.parse(updates.callHistory);
    updatePromises.push(sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!R${actualRowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[updates.callHistory]] },
    }));
    // Also update Attempt Count -> Col I (9th)
    updatePromises.push(sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!I${actualRowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[history.length.toString()]] },
    }));
  }

  // Next Follow-up Date -> Col H (8th)
  if (updates.reminderDate !== undefined) {
    updatePromises.push(sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!H${actualRowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[updates.reminderDate]] },
    }));
  }

  // Notes -> Col J (10th)
  if (updates.reminderRemark !== undefined) {
    updatePromises.push(sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!J${actualRowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[updates.reminderRemark]] },
    }));
  }

  // Website -> Col M (13th)
  if (updates.website !== undefined) {
    updatePromises.push(sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!M${actualRowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[updates.website]] },
    }));
  }

  // Instagram -> Col S (19th)
  if (updates.instagram !== undefined) {
    updatePromises.push(sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!S${actualRowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[updates.instagram]] },
    }));
  }

  // Color -> Col T (20th)
  if (updates.color !== undefined) {
    updatePromises.push(sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!T${actualRowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[updates.color]] },
    }));
  }

  // Last Call Date -> Col E (5th)
  updatePromises.push(sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!E${actualRowIndex}`,
    valueInputOption: 'RAW',
    resource: { values: [[new Date().toISOString()]] },
  }));

  await Promise.all(updatePromises);
}

async function appendLeads(leads) {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const sheetName = res.data.sheets[0].properties.title;

  const values = leads.map(lead => [
    lead.name,           // A
    lead.phone,          // B
    '',                  // C (Telecaller)
    lead.city,           // D
    new Date().toISOString(), // E (Last Updated)
    'Not Contacted',     // F (Call Status)
    '',                  // G (Outcome/Remarks)
    '',                  // H (Next Follow-up)
    '0',                 // I (Attempt Count)
    '',                  // J (Notes)
    lead.placeId,        // K
    lead.category,       // L
    lead.website,        // M
    lead.websiteStatus,  // N
    lead.mapsUrl,        // O
    lead.retrievedDate,   // P
    'FALSE',             // Q (Highlighted)
    '[]',                // R (Call History)
    '',                  // S (Instagram)
    ''                   // T (Color)
  ]);

  if (values.length === 0) return;

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:T`,
    valueInputOption: 'RAW',
    resource: { values },
  });
}

async function getExistingPlaceIds() {
  const leads = await getAllLeads();
  return new Set(leads.map(l => l.PlaceID));
}

module.exports = {
  initializeSheet, getAllLeads, updateLead, appendLeads, getExistingPlaceIds
};
