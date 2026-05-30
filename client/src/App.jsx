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
import Login from './components/Login';

// Utils
import { API_BASE, PIPELINE_VIEWS, PIPELINE_STAGES, normalizePipelineStage, matchesPipelineStage, isStarredLead } from './utils/data';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'today'
  const [viewMode, setViewMode] = useState('cards');
  const [sortConfig, setSortConfig] = useState({ key: 'LastUpdated', direction: 'desc' });
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [anchorDate, setAnchorDate] = useState(startOfToday());
  
  // New States for Views and Filtering
  const [activeView, setActiveView] = useState('crm'); // 'crm' | 'discovery' | 'bin' | pipeline ids
  const [filterColor, setFilterColor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [showAllDates, setShowAllDates] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('auth_token', token);
    setIsAuthenticated(true);
  };

  const dates = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => addDays(anchorDate, i - 4));
  }, [anchorDate]);

  const handleDateJump = (date) => {
    setAnchorDate(date);
    setSelectedDate(date);
  };

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await axios.get(`${API_BASE}/leads`);
      setLeads(res.data || []);
    } catch (error) {
      console.error('Fetch failed', error);
      setFetchError(error.response?.data?.error || 'Could not load leads. Check server and Google Sheets credentials.');
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInlineUpdate = async (placeId, updates) => {
    // Generate system log if status changed
    const lead = leads.find(l => l.PlaceID === placeId);
    let finalUpdates = { ...updates };
    
    if (updates.callStatus && updates.callStatus !== lead.CallStatus) {
      const baseHistory = updates.callHistory ? JSON.parse(updates.callHistory) : JSON.parse(lead.CallHistory || '[]');
      const newEntry = { 
        date: new Date().toISOString(), 
        note: `Status updated to: ${updates.callStatus}` 
      };
      finalUpdates.callHistory = JSON.stringify([...baseHistory, newEntry]);
    }

    if (updates.pipelineStage !== undefined && updates.pipelineStage !== (lead.PipelineStage || '')) {
      const baseHistory = finalUpdates.callHistory
        ? JSON.parse(finalUpdates.callHistory)
        : JSON.parse(lead.CallHistory || '[]');
      const label = updates.pipelineStage || 'None';
      const newEntry = {
        date: new Date().toISOString(),
        note: `Pipeline set to: ${label}`,
      };
      finalUpdates.callHistory = JSON.stringify([...baseHistory, newEntry]);
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
      highlighted: 'Highlighted',
      pipelineStage: 'PipelineStage',
    };

    const optimisticUpdates = {};
    Object.keys(finalUpdates).forEach(key => {
      const mappedKey = FIELD_MAP[key] || key;
      let value = finalUpdates[key];
      // Handle special case for Highlighted (boolean to string 'TRUE'/'FALSE')
      if (key === 'highlighted') {
        value = value ? 'TRUE' : 'FALSE';
      }
      if (key === 'pipelineStage') {
        value = normalizePipelineStage(value);
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

  const handleArchive = async (placeId, archived) => {
    const updatedLeads = leads.map(l => 
      l.PlaceID === placeId ? { ...l, Archived: archived ? 'TRUE' : 'FALSE' } : l
    );
    setLeads(updatedLeads);
    try {
      await axios.patch(`${API_BASE}/lead/${placeId}`, { archived });
    } catch (error) {
       console.error('Archive failed', error);
       fetchLeads();
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
    
    const hasPipeline = lead.PipelineStage && lead.PipelineStage.trim().length > 0;
    return hasRemark || hasColor || isHighlighted || hasReminder || hasHistory || hasPipeline;
  };

  const isPipelineView = PIPELINE_VIEWS.some((p) => p.id === activeView);
  const activePipelineMeta = PIPELINE_VIEWS.find((p) => p.id === activeView);

  const pipelineCounts = useMemo(() => {
    const counts = { starred: 0, under_process: 0, completed: 0 };
    leads.forEach((l) => {
      if (l.Archived === 'TRUE') return;
      if (isStarredLead(l)) counts.starred += 1;
      if (matchesPipelineStage(l.PipelineStage, PIPELINE_STAGES.UNDER_PROCESS)) counts.under_process += 1;
      if (matchesPipelineStage(l.PipelineStage, PIPELINE_STAGES.COMPLETED)) counts.completed += 1;
    });
    return counts;
  }, [leads]);

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
        (l.Remarks && l.Remarks.toLowerCase().includes(lowerQuery)) ||
        (l.Telecaller && l.Telecaller.toLowerCase().includes(lowerQuery)) ||
        (l.CallStatus && l.CallStatus.toLowerCase().includes(lowerQuery)) ||
        (l.ReminderRemark && l.ReminderRemark.toLowerCase().includes(lowerQuery)) ||
        (l.Instagram && l.Instagram.toLowerCase().includes(lowerQuery)) ||
        (l.ReminderDate && l.ReminderDate.includes(lowerQuery)) ||
        (l.LastUpdated && l.LastUpdated.includes(lowerQuery)) ||
        (l.Category && l.Category.toLowerCase().includes(lowerQuery)) ||
        (l.CallHistory && l.CallHistory.toLowerCase().includes(lowerQuery)) ||
        (l.PipelineStage && l.PipelineStage.toLowerCase().includes(lowerQuery))
      );
    }

    // 1. Filter by View Role
    if (activeView === 'bin') {
      list = list.filter(l => l.Archived === 'TRUE');
    } else if (isPipelineView && activePipelineMeta) {
      if (activeView === 'starred') {
        list = list.filter((l) => isStarredLead(l));
      } else {
        list = list.filter(
          (l) => l.Archived !== 'TRUE' && matchesPipelineStage(l.PipelineStage, activePipelineMeta.stage)
        );
      }
    } else {
      list = list.filter(l => l.Archived !== 'TRUE');
      
      if (activeView === 'crm') {
        list = list.filter(l => isLeadEdited(l));
      } else if (activeView === 'discovery') {
        list = list.filter(l => !isLeadEdited(l));
      }
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
  }, [leads, sortConfig, activeView, filterColor, searchQuery, isPipelineView, activePipelineMeta]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const useReminderDateFilter =
    activeView === 'crm' && activeTab === 'today' && !showAllDates && !isPipelineView;

  const displayLeads = useReminderDateFilter
    ? processedLeads.filter((l) => l.ReminderDate === selectedDateStr)
    : processedLeads;

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden selection:bg-white/10">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
        setShowAllDates={setShowAllDates}
        pipelineCounts={pipelineCounts}
      />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#050505] w-full relative">
        <Header 
          selectedDate={selectedDate}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
          filterColor={filterColor}
          setFilterColor={setFilterColor}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 md:space-y-12 no-scrollbar lg:custom-scrollbar">
          {fetchError && (
            <div className="mx-4 md:mx-10 -mb-4 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs font-medium tracking-wide">
              {fetchError}
            </div>
          )}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-stretch">
            <div className={`min-w-0 ${activeView === 'discovery' ? 'flex-1' : 'w-full'}`}>
              <Timeline 
                dates={dates}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                onDateJump={handleDateJump}
                showAllDates={showAllDates}
                setShowAllDates={setShowAllDates}
              />
            </div>
            {activeView === 'discovery' && (
              <div className="w-full lg:w-[280px] xl:w-[300px] shrink-0">
                <ScraperForm compact onComplete={fetchLeads} />
              </div>
            )}
          </div>

          <section key={`${activeView}-${activeTab}`} className="space-y-8 pb-20 animate-in fade-in duration-500 ease-out">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
               <div className="flex items-center gap-4">
                 <h3 className="text-sm font-medium text-white/40 uppercase tracking-[0.4em] serif !text-white/80">
                   {isPipelineView
                      ? activePipelineMeta?.label
                      : activeView === 'crm' 
                      ? (activeTab === 'active' || showAllDates
                          ? 'Operational CRM Dataset'
                          : `Leads for ${format(selectedDate, 'MMM d')}`)
                      : (activeView === 'bin' ? 'Archived Intelligence' : 'Discovery Data Pool')
                   }
                 </h3>
                 <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] text-white/40 tracking-widest uppercase">
                    {isPipelineView ? 'Pipeline Stage' : activeView === 'crm' ? 'Autonomous CRM Sync' : (activeView === 'bin' ? 'Recycle Bin' : 'Raw Intelligence')}
                 </span>
               </div>
            </div>

            {displayLeads.length > 0 ? (
              viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                  {displayLeads.map((lead, idx) => (
                    <div key={lead.PlaceID} className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: `${Math.min(idx, 8) * 50}ms` }}>
                    <LeadCard 
                      lead={lead} 
                      onUpdate={(updates) => handleInlineUpdate(lead.PlaceID, updates)} 
                      onArchive={(archived) => handleArchive(lead.PlaceID, archived)}
                      index={idx} 
                    />
                    </div>
                  ))}
                </div>
              ) : (
                <SheetView 
                  displayLeads={displayLeads} 
                  handleInlineUpdate={handleInlineUpdate}
                  handleArchive={handleArchive}
                  sortConfig={sortConfig}
                  setSortConfig={setSortConfig}
                />
              )
            ) : (
              <div className="h-80 flex flex-col items-center justify-center bg-white/[0.02] rounded-2xl text-white/20 border border-dashed border-white/10">
                <p className="text-sm font-medium uppercase tracking-[0.4em]">Partition Empty</p>
                <p className="text-[10px] mt-2 text-white/10 uppercase tracking-widest font-medium text-center max-w-xs">
                  {activeView === 'discovery'
                    ? 'No raw leads yet — use Harvest or pick All in the tray.'
                    : isPipelineView
                    ? `No leads marked as ${activePipelineMeta?.label} — set stage inside a lead card.`
                    : 'Awaiting field intelligence logs.'}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
