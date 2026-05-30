import { subHours } from 'date-fns';

export const API_BASE = '/api';

export const DUMMY_DATA = [
  {
    PlaceID: "p-1",
    BusinessName: "Lumina Digital Partners",
    Phone: "+91 20 1234 5678",
    WebsiteStatus: "broken",
    Category: "IT Services",
    LastUpdated: new Date().toISOString(),
    RetrievedDate: new Date().toISOString(),
    City: "Pune",
    GoogleMapsLink: "https://maps.google.com",
    Remarks: "High priority follow-up needed.",
    Highlighted: "TRUE",
    CallHistory: JSON.stringify([
      { date: subHours(new Date(), 48).toISOString(), note: "Initial outreach. No response." },
      { date: subHours(new Date(), 24).toISOString(), note: "Called back. Secretary says to email proposal." }
    ])
  },
  {
    PlaceID: "p-2",
    BusinessName: "Apex Marketing Group",
    Phone: "+91 20 5550 0193",
    WebsiteStatus: "missing",
    Category: "Ad Agency",
    LastUpdated: subHours(new Date(), 2).toISOString(),
    RetrievedDate: subHours(new Date(), 24).toISOString(),
    City: "Pune",
    GoogleMapsLink: "https://maps.google.com",
    Remarks: "Interested in SEO audit.",
    Highlighted: "FALSE",
    CallHistory: "[]"
  },
  {
    PlaceID: "p-3",
    BusinessName: "Quantum Tech Solutions",
    Phone: "+91 20 7946 0012",
    WebsiteStatus: "Live",
    Category: "Software",
    LastUpdated: subHours(new Date(), 5).toISOString(),
    RetrievedDate: subHours(new Date(), 48).toISOString(),
    City: "Pune",
    GoogleMapsLink: "https://maps.google.com",
    Remarks: "",
    Highlighted: "FALSE",
    CallHistory: "[]"
  },
  {
    PlaceID: "p-4",
    BusinessName: "EcoBuild Systems",
    Phone: "+91 20 5432 1098",
    WebsiteStatus: "Live",
    Category: "Architecture",
    LastUpdated: subHours(new Date(), 10).toISOString(),
    RetrievedDate: subHours(new Date(), 72).toISOString(),
    City: "Pune",
    GoogleMapsLink: "https://maps.google.com",
    Remarks: "",
    Highlighted: "FALSE",
    CallHistory: "[]"
  }
];

export const CARD_COLORS = [
  'bg-white',
  'bg-green-300',
  'bg-yellow-300',
  'bg-orange-300', 
];

/** Stored in Google Sheet column V — must match server sheets.js */
export const PIPELINE_STAGES = {
  STARRED: 'Starred',
  UNDER_PROCESS: 'Under Process',
  COMPLETED: 'Completed',
};

export const PIPELINE_VIEWS = [
  { id: 'starred', label: 'Starred', stage: PIPELINE_STAGES.STARRED },
  { id: 'under_process', label: 'Under Process', stage: PIPELINE_STAGES.UNDER_PROCESS },
  { id: 'completed', label: 'Completed', stage: PIPELINE_STAGES.COMPLETED },
];

/** Match sheet values to canonical stage (handles typos / legacy labels) */
export function normalizePipelineStage(value) {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (lower === 'starred' || lower === 'started') return PIPELINE_STAGES.STARRED;
  if (lower === 'under process' || lower === 'in progress' || lower === 'progress') {
    return PIPELINE_STAGES.UNDER_PROCESS;
  }
  if (lower === 'completed' || lower === 'complete') return PIPELINE_STAGES.COMPLETED;
  const canonical = Object.values(PIPELINE_STAGES);
  const found = canonical.find((c) => c.toLowerCase() === lower);
  return found || trimmed;
}

export function matchesPipelineStage(leadStage, targetStage) {
  return normalizePipelineStage(leadStage) === normalizePipelineStage(targetStage);
}

/** Starred tab: column V and legacy Highlighted flag */
export function isStarredLead(lead) {
  if (!lead || lead.Archived === 'TRUE') return false;
  if (matchesPipelineStage(lead.PipelineStage, PIPELINE_STAGES.STARRED)) return true;
  return lead.Highlighted === 'TRUE';
}



