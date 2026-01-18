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



