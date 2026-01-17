require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeSheet, getAllLeads, updateLead, appendLeads, getExistingPlaceIds } = require('./sheets');
const { scrapeLeads, getUsage } = require('./scraper');

const app = express();
app.use(cors());
app.use(express.json());

const router = express.Router();

// Initialize Sheet headers on startup
initializeSheet();

// Endpoints
router.get('/leads', async (req, res) => {
  try {
    const leads = await getAllLeads();
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/lead/:place_id', async (req, res) => {
  try {
    const { place_id } = req.params;
    console.log(`[PATCH] Updating lead ${place_id}`, req.body); // DEBUG LOG
    const { remarks, highlighted, callHistory, reminderDate, reminderRemark, name, phone, city, telecaller, callStatus } = req.body;
    await updateLead(place_id, { remarks, highlighted, callHistory, reminderDate, reminderRemark, name, phone, city, telecaller, callStatus });
    res.json({ success: true });
  } catch (error) {
    console.error(`[PATCH ERROR]`, error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/scrape', async (req, res) => {
  try {
    const { city, categories } = req.body;
    if (!city || !categories || !Array.isArray(categories)) {
      return res.status(400).json({ error: 'City and categories (array) are required' });
    }

    const existingIds = await getExistingPlaceIds();
    const newLeads = await scrapeLeads(city, categories, existingIds);
    
    if (newLeads.length > 0) {
      await appendLeads(newLeads);
    }

    res.json({ 
      count: newLeads.length, 
      usage: getUsage(),
      message: `Scraped ${newLeads.length} new leads.` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mount router at /api for Vercel/Production and / for local convenience if needed
app.use('/api', router);
app.use('/', router);

const PORT = process.env.PORT || 5000;

// Only listen if run directly (local dev), otherwise export for Vercel
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
