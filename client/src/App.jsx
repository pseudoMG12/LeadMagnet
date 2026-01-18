import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { startOfToday, addDays, format } from 'date-fns';

// UI Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Timeline from './components/Timeline';
import ScraperForm from './components/ScraperForm';
import LeadCard from './components/LeadCard';
import SheetView from './components/SheetView';

// Utils
import { API_BASE, DUMMY_DATA, CARD_COLORS } from './utils/data';

function App() {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'today'
  const [viewMode, setViewMode] = useState('cards');
  const [sortConfig, setSortConfig] = useState({ key: 'LastUpdated', direction: 'desc' });
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [anchorDate, setAnchorDate] = useState(startOfToday());
  
  // New States for Views and Filtering
  const [activeView, setActiveView] = useState('crm'); // 'crm' | 'discovery'
  const [filterColor, setFilterColor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const dates = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => addDays(anchorDate, i - 4));
  }, [anchorDate]);

  const handleDateJump = (date) => {
    setAnchorDate(date);
    setSelectedDate(date);
  };

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/leads`);
      setLeads(res.data || []);
    } catch (error) {
      console.error('Fetch failed, showing dummy data');
      setLeads(DUMMY_DATA);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInlineUpdate = async (placeId, updates) => {
    // Generate system log if status changed
    const lead = leads.find(l => l.PlaceID === placeId);
    let finalUpdates = { ...updates };
    
    if (updates.callStatus && updates.callStatus !== lead.CallStatus) {
      const history = JSON.parse(lead.CallHistory || '[]');
      const newEntry = { 
        date: new Date().toISOString(), 
        note: `Status updated to: ${updates.callStatus}` 
      };
      finalUpdates.callHistory = JSON.stringify([...history, newEntry]);
    }

    // Map lowercase keys to Uppercase state keys for Optimistic Update
    const FIELD_MAP = {
      name: 'BusinessName',
      phone: 'Phone',
      city: 'City',
      instagram: 'Instagram',
      website: 'Website',
      telecaller: 'Telecaller',
      callStatus: 'CallStatus',
      remarks: 'Remarks',
      reminderDate: 'ReminderDate',
      reminderRemark: 'ReminderRemark',
      callHistory: 'CallHistory',
      color: 'Color',
      highlighted: 'Highlighted'
    };

    const optimisticUpdates = {};
    Object.keys(finalUpdates).forEach(key => {
      const mappedKey = FIELD_MAP[key] || key;
      let value = finalUpdates[key];
      // Handle special case for Highlighted (boolean to string 'TRUE'/'FALSE')
      if (key === 'highlighted') {
        value = value ? 'TRUE' : 'FALSE';
      }
      optimisticUpdates[mappedKey] = value;
    });

    const updatedLeads = leads.map(l => 
      l.PlaceID === placeId ? { ...l, ...optimisticUpdates, LastUpdated: new Date().toISOString() } : l
    );
    setLeads(updatedLeads);
    try {
      await axios.patch(`${API_BASE}/lead/${placeId}`, finalUpdates);
      // fetchLeads(); // Optional: We trust the optimistic update. Fetching might reset state unnecessarily or cause flicker. 
      // Keeping it commented out or removed for "Instant" feel, or debouncing it. 
      // For now, let's remove it to prioritize speed as per user request, or keep it if we really need to sync.
      // The user wants "Color updated instantly".
    } catch (error) {
      console.error('Sync failed', error);
      // Revert on failure could be implemented here
      fetchLeads(); // Re-fetch to get correct state back
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const isLeadEdited = (lead) => {
    const hasRemark = lead.Remarks && lead.Remarks.trim().length > 0;
    const hasColor = lead.Color && lead.Color.trim().length > 0;
    const isHighlighted = lead.Highlighted === 'TRUE';
    const hasReminder = lead.ReminderDate && lead.ReminderDate.length > 0;
    
    let hasHistory = false;
    try {
       const h = JSON.parse(lead.CallHistory || '[]');
       if (h.length > 0) hasHistory = true;
    } catch(e) {}
    
    return hasRemark || hasColor || isHighlighted || hasReminder || hasHistory;
  };

  const processedLeads = useMemo(() => {
    let list = [...leads];
    
    // 0. Filter by Search Query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      list = list.filter(l => 
        (l.BusinessName && l.BusinessName.toLowerCase().includes(lowerQuery)) ||
        (l.Phone && l.Phone.toLowerCase().includes(lowerQuery)) ||
        (l.City && l.City.toLowerCase().includes(lowerQuery)) ||
        (l.Website && l.Website.toLowerCase().includes(lowerQuery)) ||
        (l.Remarks && l.Remarks.toLowerCase().includes(lowerQuery))
      );
    }

    // 1. Filter by View Role (CRM = Edited, Discovery = Unedited)
    if (activeView === 'crm') {
      list = list.filter(l => isLeadEdited(l));
    } else {
      list = list.filter(l => !isLeadEdited(l));
    }

    // 2. Filter by Color
    if (filterColor) {
      list = list.filter(l => l.Color === filterColor);
    }
    
    // Sorting logic
    list.sort((a, b) => {
      let valA = a[sortConfig.key] || '';
      let valB = b[sortConfig.key] || '';

      if (sortConfig.key === 'LastUpdated' || sortConfig.key === 'ReminderDate') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [leads, sortConfig, activeView, filterColor, searchQuery]);

  // Filter leads based on the Selected Date in Timeline (defaults to Today)
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const scheduledLeads = processedLeads.filter(l => l.ReminderDate === selectedDateStr);
  
  // Display View Logic
  const displayLeads = activeTab === 'active' ? processedLeads : scheduledLeads;

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden selection:bg-white/10">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#050505]">
        <Header 
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          viewMode={viewMode}
          setViewMode={setViewMode}
          activeCount={leads.length}
          todayCount={scheduledLeads.length}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
          filterColor={filterColor}
          setFilterColor={setFilterColor}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar lg:custom-scrollbar">
          <Timeline 
            dates={dates}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onDateJump={handleDateJump}
          />

          {activeView === 'discovery' && (
            <section className="animate-in fade-in duration-700">
              <ScraperForm onComplete={fetchLeads} />
            </section>
          )}

          <section className="space-y-8 pb-20">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
               <div className="flex items-center gap-4">
                 <h3 className="text-sm font-medium text-white/40 uppercase tracking-[0.4em] serif !text-white/80">
                   {activeView === 'crm' 
                      ? (activeTab === 'active' ? 'Operational CRM Dataset' : 'Leads Scheduled for Today')
                      : 'Discovery Data Pool'
                   }
                 </h3>
                 <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] text-white/40 tracking-widest uppercase">
                    {activeView === 'crm' ? 'Autonomous CRM Sync' : 'Raw Intelligence'}
                 </span>
               </div>
            </div>

            {displayLeads.length > 0 ? (
              viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 animate-in zoom-in-95 duration-500">
                  {displayLeads.map((lead, idx) => (
                    <LeadCard 
                      key={lead.PlaceID} 
                      lead={lead} 
                      onUpdate={(updates) => handleInlineUpdate(lead.PlaceID, updates)} 
                      index={idx} 
                    />
                  ))}
                </div>
              ) : (
                <SheetView 
                  displayLeads={displayLeads} 
                  handleInlineUpdate={handleInlineUpdate}
                  sortConfig={sortConfig}
                  setSortConfig={setSortConfig}
                />
              )
            ) : (
              <div className="h-80 flex flex-col items-center justify-center bg-white/[0.02] rounded-2xl text-white/20 border border-dashed border-white/10">
                <p className="text-sm font-medium uppercase tracking-[0.4em]">Partition Empty</p>
                <p className="text-[10px] mt-2 text-white/10 uppercase tracking-widest font-medium">Awaiting field intelligence logs.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
