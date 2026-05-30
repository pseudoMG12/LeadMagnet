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

/** Stable ID when column K (Place ID) is empty — must match getAllLeads() */
function generateSyntheticPlaceId(leadName, dataRowIndex) {
  if (leadName && String(leadName).trim()) {
    const slug = String(leadName)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase()
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    if (slug) return `manual-${slug}`;
  }
  return `manual-${dataRowIndex}`;
}

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
  'Color',               // T (Technical - Card Color)
  'Archived',            // U (Technical - Boolean)
  'Pipeline Stage'       // V (Starred | Under Process | Completed)
];

const PIPELINE_STAGE_COL = 21; // column V, 0-based index

function normalizePipelineStage(value) {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (lower === 'starred' || lower === 'started') return 'Starred';
  if (lower === 'under process' || lower === 'in progress' || lower === 'progress') return 'Under Process';
  if (lower === 'completed' || lower === 'complete') return 'Completed';
  const canonical = ['Starred', 'Under Process', 'Completed'];
  const found = canonical.find((c) => c.toLowerCase() === lower);
  return found || trimmed;
}

async function ensureSchemaHeaders(sheets, sheetName) {
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A1:V1`,
  });
  const currentHeaders = headerRes.data.values?.[0] || [];
  const hasPipeline = currentHeaders[PIPELINE_STAGE_COL] === 'Pipeline Stage';
  const headersMatch =
    currentHeaders.length >= SCHEMA.length &&
    SCHEMA.every((h, i) => h === (currentHeaders[i] || ''));

  if (!headersMatch || !hasPipeline) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1:V1`,
      valueInputOption: 'RAW',
      resource: { values: [SCHEMA] },
    });
    console.log('✅ Sheet schema synced (incl. Pipeline Stage column V).');
  }
}

async function initializeSheet() {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const res = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    const sheetName = res.data.sheets[0].properties.title;

    await ensureSchemaHeaders(sheets, sheetName);
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
  await ensureSchemaHeaders(sheets, sheetName);

  const data = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:V`,
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
    
    const placeId = (lead.PlaceID && String(lead.PlaceID).trim())
      ? lead.PlaceID
      : generateSyntheticPlaceId(lead.LeadName, index);
    
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
      Archived: lead.Archived || 'FALSE',
      PipelineStage: normalizePipelineStage(lead.PipelineStage || row[PIPELINE_STAGE_COL] || ''),
      GoogleMapsLink: lead.GoogleMapsLink || (lead.LeadName ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.LeadName + ' ' + (lead.BusinessCity || ''))}` : '')
    };
  });
}

async function findLeadRowIndex(sheets, sheetName, placeId) {
  const [resIds, resNames] = await Promise.all([
    sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!K:K`,
    }),
    sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:A`,
    }),
  ]);

  const placeIds = resIds.data.values ? resIds.data.values.map(row => row[0] || '') : [];
  let rowIndex = placeIds.indexOf(placeId);

  if (rowIndex === -1) {
    const names = resNames.data.values ? resNames.data.values.map(row => row[0] || '') : [];
    for (let i = 1; i < names.length; i++) {
      const synthetic = generateSyntheticPlaceId(names[i], i - 1);
      if (synthetic === placeId) {
        rowIndex = i;
        break;
      }
    }
  }

  return { rowIndex, placeIds };
}

async function updateLead(placeId, updates) {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  const resMeta = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const sheetName = resMeta.data.sheets[0].properties.title;

  const { rowIndex, placeIds } = await findLeadRowIndex(sheets, sheetName, placeId);

  if (rowIndex === -1) throw new Error('Lead not found');

  const actualRowIndex = rowIndex + 1;

  const data = [];

  // Backfill Place ID in column K when it was empty (synthetic ID used in the app)
  const existingPlaceId = placeIds[rowIndex] || '';
  if (!existingPlaceId.trim()) {
    data.push({
      range: `${sheetName}!K${actualRowIndex}`,
      values: [[placeId]],
    });
  }

  // Lead Name -> Col A
  if (updates.name !== undefined) {
    data.push({
      range: `${sheetName}!A${actualRowIndex}`,
      values: [[updates.name]]
    });
  }

  // Phone Number -> Col B
  if (updates.phone !== undefined) {
    data.push({
      range: `${sheetName}!B${actualRowIndex}`,
      values: [[updates.phone]]
    });
  }

  // Telecaller -> Col C
  if (updates.telecaller !== undefined) {
    data.push({
      range: `${sheetName}!C${actualRowIndex}`,
      values: [[updates.telecaller]]
    });
  }

  // Business / City -> Col D
  if (updates.city !== undefined) {
    data.push({
      range: `${sheetName}!D${actualRowIndex}`,
      values: [[updates.city]]
    });
  }

  // Call Status -> Col F
  if (updates.callStatus !== undefined) {
    data.push({
      range: `${sheetName}!F${actualRowIndex}`,
      values: [[updates.callStatus]]
    });
  }

  // Outcome (Remarks) -> Col G
  if (updates.remarks !== undefined) {
    data.push({
      range: `${sheetName}!G${actualRowIndex}`,
      values: [[updates.remarks]]
    });
  }

  // Highlighted -> Col Q
  if (updates.highlighted !== undefined) {
    data.push({
      range: `${sheetName}!Q${actualRowIndex}`,
      values: [[updates.highlighted ? 'TRUE' : 'FALSE']]
    });
  }

  // Call History -> Col R
  if (updates.callHistory !== undefined) {
    const history = JSON.parse(updates.callHistory);
    data.push({
      range: `${sheetName}!R${actualRowIndex}`,
      values: [[updates.callHistory]]
    });
    // Also update Attempt Count -> Col I
    data.push({
      range: `${sheetName}!I${actualRowIndex}`,
      values: [[history.length.toString()]]
    });
  }

  // Next Follow-up Date -> Col H
  if (updates.reminderDate !== undefined) {
    data.push({
      range: `${sheetName}!H${actualRowIndex}`,
      values: [[updates.reminderDate]]
    });
  }

  // Notes -> Col J
  if (updates.reminderRemark !== undefined) {
    data.push({
      range: `${sheetName}!J${actualRowIndex}`,
      values: [[updates.reminderRemark]]
    });
  }

  // Website -> Col M
  if (updates.website !== undefined) {
    data.push({
      range: `${sheetName}!M${actualRowIndex}`,
      values: [[updates.website]]
    });
  }

  // Instagram -> Col S
  if (updates.instagram !== undefined) {
    data.push({
      range: `${sheetName}!S${actualRowIndex}`,
      values: [[updates.instagram]]
    });
  }

  // Color -> Col T
  if (updates.color !== undefined) {
    data.push({
      range: `${sheetName}!T${actualRowIndex}`,
      values: [[updates.color]]
    });
  }

  // Archived -> Col U
  if (updates.archived !== undefined) {
    data.push({
      range: `${sheetName}!U${actualRowIndex}`,
      values: [[updates.archived ? 'TRUE' : 'FALSE']]
    });
  }

  // Pipeline Stage -> Col V
  if (updates.pipelineStage !== undefined) {
    data.push({
      range: `${sheetName}!V${actualRowIndex}`,
      values: [[normalizePipelineStage(updates.pipelineStage)]]
    });
  }

  // Last Call Date -> Col E
  data.push({
    range: `${sheetName}!E${actualRowIndex}`,
    values: [[new Date().toISOString()]]
  });

  if (data.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: data
      }
    });
  }
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
    '',                  // T (Color)
    'FALSE',             // U (Archived)
    ''                   // V (Pipeline Stage)
  ]);

  if (values.length === 0) return;

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:V`,
    valueInputOption: 'RAW',
    resource: { values },
  });
}

async function syncOverdueLeads() {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const leads = await getAllLeads();
    const now = new Date();
    // Use local date parts to construct yyyy-MM-dd for alignment with user's local day
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    
    const today = new Date(yyyy, now.getMonth(), now.getDate());

    const res = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    const sheetName = res.data.sheets[0].properties.title;

    const updates = [];
    leads.forEach((lead, index) => {
      if (lead.ReminderDate && lead.ReminderDate.includes('-')) {
        const [ry, rm, rd] = lead.ReminderDate.split('-').map(Number);
        if (!isNaN(ry) && !isNaN(rm) && !isNaN(rd)) {
          const rDate = new Date(ry, rm - 1, rd);
          if (rDate < today) {
            updates.push({
              range: `${sheetName}!H${index + 2}`,
              values: [[todayStr]]
            });
          }
        }
      }
    });

    if (updates.length > 0) {
      console.log(`[SYNC] Rollover ${updates.length} overdue leads to ${todayStr}`);
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
    }
    return updates.length;
  } catch (error) {
    console.error('Error syncing overdue leads:', error.message);
    return 0;
  }
}

async function getExistingPlaceIds() {
  const leads = await getAllLeads();
  return new Set(leads.map(l => l.PlaceID));
}

module.exports = {
  initializeSheet, getAllLeads, updateLead, appendLeads, getExistingPlaceIds, syncOverdueLeads
};
