import React, { useState, useEffect, useRef } from 'react';
import { Phone, Globe, Star, ExternalLink, X, MapPin, Instagram, Link as LinkIcon, AlertCircle, Calendar, Activity, Check, Cloud } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { safeFormat } from '../utils/date';

import { CARD_COLORS } from '../utils/data';

const LeadModal = ({ lead, onClose, onUpdate, isSaving, cardColor: initialColor }) => {
  // Use a local state object for all fields to avoid stale closure issues during auto-save
  const [formData, setFormData] = useState({
    name: lead.BusinessName,
    phone: lead.Phone,
    city: lead.City,
    instagram: lead.Instagram || '',
    website: lead.Website || '',
    telecaller: lead.Telecaller || '',
    callStatus: lead.CallStatus || 'Not Contacted',
    remarks: lead.Remarks || '',
    reminderDate: lead.ReminderDate || '',
    reminderRemark: lead.ReminderRemark || '',
    color: lead.Color || initialColor || 'bg-white',
    history: JSON.parse(lead.CallHistory || '[]')
  });

  const [newNote, setNewNote] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'waiting' | 'saving' | 'saved'
  const debounceTimer = useRef(null);
  const isInitialMount = useRef(true);
  
  // Critical for preventing partial saves: Always keep a ref to the latest state
  const latestData = useRef(formData);
  useEffect(() => {
    latestData.current = formData;
  }, [formData]);

  // Auto-save logic
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus('waiting');
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      performSave();
    }, 1500); // 1.5s debounce for intelligence text

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [formData]);

  const performSave = async (overrides = {}) => {
    // Merge latest data with any specific overrides (like a new history note)
    const dataToSave = { ...latestData.current, ...overrides };
    setSaveStatus('saving');
    
    try {
      await onUpdate({
        name: dataToSave.name,
        phone: dataToSave.phone,
        city: dataToSave.city,
        instagram: dataToSave.instagram,
        website: dataToSave.website,
        telecaller: dataToSave.telecaller,
        callStatus: dataToSave.callStatus,
        remarks: dataToSave.remarks,
        reminderDate: dataToSave.reminderDate,
        reminderRemark: dataToSave.reminderRemark,
        callHistory: JSON.stringify(dataToSave.history),
        color: dataToSave.color
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error("Save failed in modal", error);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleManualSave = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    // Force immediate save of EVERYTHING in the current state
    performSave();
  };

  const addHistoryNote = () => {
    if (!newNote.trim()) return;
    
    const newEntry = { date: new Date().toISOString(), note: newNote.trim() };
    const updatedHistory = [...formData.history, newEntry];
    
    // For local reliability, we update state and force an immediate save for notes
    setFormData(prev => ({ 
      ...prev, 
      history: updatedHistory,
      reminderRemark: newNote.trim()
    }));
    
    setNewNote('');
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    performSave({ 
      history: updatedHistory, 
      reminderRemark: newNote.trim() 
    });
  };

  const getStatusIcon = () => {
    switch (saveStatus) {
      case 'waiting': return <Cloud size={14} className="text-black/20 animate-pulse" />;
      case 'saving': return <div className="w-3.5 h-3.5 border-2 border-black/10 border-t-black rounded-full animate-spin" />;
      case 'saved': return <Check size={14} className="text-green-600" />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 md:bg-black/80 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className={`${formData.color} w-full h-full md:h-[90vh] md:max-w-[75rem] md:rounded-3xl p-2 md:p-3 relative shadow-2xl border flex flex-col lg:flex-row gap-3 transition-all duration-300 overflow-y-auto md:overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white text-black rounded-full border border-black/5 hover:scale-110 transition-transform z-50 shadow-xl"
        >
          <X size={20} strokeWidth={2} />
        </button>

        {/* --- LEFT PANEL: INFO & INTELLIGENCE --- */}
         <div className="flex-none lg:flex-[2] bg-gradient-to-b from-white via-white/80 to-white/60 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col gap-5 shadow-2xl md:overflow-y-auto custom-scrollbar-black text-black min-h-fit">
           
           {/* Header Section */}
           <div className="space-y-3">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-black/40 font-bold">Business Entity</span>
                    {getStatusIcon()}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 md:mr-10">
                    {CARD_COLORS.map((c) => (
                       <button 
                         key={c}
                         onClick={(e) => { e.stopPropagation(); updateField('color', c); }}
                         className={`w-4 h-4 md:w-3.5 md:h-3.5 rounded-full border border-black/10 transition-all ${c} ${formData.color === c ? 'scale-125 ring-2 ring-black/30 shadow-sm' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                         title="Set Color"
                       />
                     ))}
                  </div>
               </div>
               <input 
                 className="w-full text-2xl md:text-4xl serif tracking-tight leading-tight bg-transparent border-none focus:outline-none placeholder:text-black/10 -ml-1 py-1 text-black font-medium"
                 value={formData.name}
                 onChange={(e) => updateField('name', e.target.value)}
                 placeholder="Business Name"
               />
               
               {/* Quick Pills */}
               <div className="flex flex-wrap gap-2">
                 <a href={lead.GoogleMapsLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1 bg-black/5 hover:bg-black/10 rounded-full text-black/60 transition-all text-[10px] font-bold uppercase tracking-wide">
                    <MapPin size={10} className="opacity-50" />
                    <span>Maps</span>
                 </a>
                 {formData.website && (
                   <a href={formData.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1 bg-black/5 hover:bg-black/10 rounded-full text-black/60 transition-all text-[10px] font-bold uppercase tracking-wide">
                     <Globe size={10} className="opacity-50" />
                     <span>Website</span>
                   </a>
                 )}
               </div>
           </div>

           {/* Cards Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Card 1: Location */}
              <div className="bg-black/5 rounded-2xl p-4 space-y-2 group hover:bg-black/10 transition-colors">
                  <div className="flex items-center gap-2 text-black/40 mb-1">
                      <MapPin size={12} />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Location</span>
                  </div>
                  <input 
                    className="w-full bg-transparent border-none p-0 text-sm font-semibold text-black focus:outline-none placeholder:text-black/20"
                    placeholder="Add City..."
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
              </div>

              {/* Card 2: Contact */}
              <div className="bg-black/5 rounded-2xl p-4 space-y-2 group hover:bg-black/10 transition-colors">
                  <div className="flex items-center gap-2 text-black/40 mb-1">
                      <Phone size={12} />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Contact</span>
                  </div>
                  <input 
                    className="w-full bg-transparent border-none p-0 text-sm font-semibold text-black focus:outline-none placeholder:text-black/20"
                    placeholder="Add Phone..."
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
              </div>

              {/* Card 3: Instagram */}
              <div className="bg-black/5 rounded-2xl p-4 space-y-2 group hover:bg-black/10 transition-colors relative">
                  <div className="flex items-center justify-between text-black/40 mb-1">
                      <div className="flex items-center gap-2">
                        <Instagram size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Instagram</span>
                      </div>
                      <span className="text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                  </div>
                  <input 
                    className="w-full bg-transparent border-none p-0 text-sm font-semibold text-black focus:outline-none placeholder:text-black/20"
                    placeholder="@username"
                    value={formData.instagram}
                    onChange={(e) => updateField('instagram', e.target.value)}
                  />
              </div>

               {/* Card 4: Website */}
               <div className="bg-black/5 rounded-2xl p-4 space-y-2 group hover:bg-black/10 transition-colors relative">
                  <div className="flex items-center justify-between text-black/40 mb-1">
                      <div className="flex items-center gap-2">
                         <Globe size={12} />
                         <span className="text-[9px] font-bold uppercase tracking-wider">Website</span>
                      </div>
                      {formData.website && <a href={formData.website} target="_blank" rel="noreferrer" className="md:absolute top-4 right-4 p-1 hover:bg-black/10 rounded-full"><ExternalLink size={12} /></a>}
                  </div>
                  <input 
                    className="w-full bg-transparent border-none p-0 text-sm font-semibold text-black focus:outline-none placeholder:text-black/20"
                    placeholder="https://..."
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                  />
              </div>

              {/* Card 5: Status */}
              <div className="bg-black/5 rounded-2xl p-4 space-y-2 group hover:bg-black/10 transition-colors">
                  <div className="flex items-center gap-2 text-black/40 mb-1">
                      <ExternalLink size={12} className="rotate-90" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Status</span>
                  </div>
                  <select 
                     className="w-full bg-transparent border-none p-0 text-sm font-semibold text-black focus:outline-none cursor-pointer appearance-none"
                     value={formData.callStatus}
                     onChange={(e) => updateField('callStatus', e.target.value)}
                   >
                      <option value="Not Contacted">Not Contacted</option>
                      <option value="Connected">Connected</option>
                      <option value="Busy">Busy</option>
                      <option value="Switch Off">Switch Off</option>
                      <option value="Wrong Number">Wrong/Invalid</option>
                      <option value="Follow Up">Follow Up</option>
                   </select>
              </div>

               {/* Card 6: Assignee */}
               <div className="bg-black/5 rounded-2xl p-4 space-y-2 group hover:bg-black/10 transition-colors">
                   <div className="flex items-center gap-2 text-black/40 mb-1">
                       <Activity size={12} />
                       <span className="text-[9px] font-bold uppercase tracking-wider">Assignee</span>
                   </div>
                   <input 
                     className="w-full bg-transparent border-none p-0 text-sm font-semibold text-black focus:outline-none placeholder:text-black/20"
                     placeholder="Select Telecaller..."
                     value={formData.telecaller}
                     onChange={(e) => updateField('telecaller', e.target.value)}
                   />
               </div>

           </div>
           
           {/* Integrated Intelligence Box */}
           <div className="mt-auto flex-1 flex flex-col min-h-[200px] mb-4 lg:mb-0">
               <div className="flex justify-between items-center mb-2 px-1">
                   <span className="text-[9px] uppercase tracking-[0.3em] text-black/40 font-bold">Internal Intelligence</span>
                   {formData.reminderRemark && <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Sync: {formData.reminderRemark}</span>}
               </div>
               
               <div className="relative group flex-1 min-h-[150px]">
                  <textarea 
                     className="w-full h-full bg-white/50 shadow-xl focus:border-black/10 focus:bg-white rounded-2xl p-4 md:p-5 text-sm font-medium text-black placeholder:text-black/20 focus:outline-none transition-all resize-none leading-relaxed custom-scrollbar-black pb-14"
                     placeholder="Enter detailed strategic remarks and intelligence..."
                     value={formData.remarks}
                     onChange={(e) => updateField('remarks', e.target.value)}
                  />
                  
                  <button 
                    onClick={handleManualSave}
                    disabled={saveStatus === 'saving'}
                    className="absolute bottom-3 right-3 md:bottom-4 md:right-4 px-4 md:px-5 py-2 bg-black text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black/80 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                  >
                    {saveStatus === 'saving' ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <span>Save Sync</span>}
                  </button>
               </div>
           </div>
         </div>

        {/* --- RIGHT PANEL: ACTIVITY LOG --- */}
         <div className="flex-none lg:flex-1 bg-white/80 rounded-2xl md:rounded-3xl relative shadow-2xl overflow-hidden text-black flex flex-col min-h-[400px] lg:min-h-0 mb-4 lg:mb-0">
            <div className="absolute top-0 left-0 right-0 p-5 pb-3 flex justify-between items-center z-20 backdrop-blur-sm bg-gradient-to-b from-white to-transparent">
               <span className="text-[10px] uppercase tracking-[0.3em] text-black/40 font-bold">Activity Feed</span>
                <span className="text-[10px] font-bold text-black/30">{formData.history.length}</span>
           </div>
           
           <div 
             className="flex-1 overflow-y-auto space-y-5 custom-scrollbar-black p-5 pt-16 pb-64"
             style={{ 
               maskImage: 'linear-gradient(to bottom, transparent 0px, black 80px, black calc(100% - 250px), transparent 100%)',
               WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 80px, black calc(100% - 250px), transparent 100%)' 
             }}
           >
               {formData.history.length > 0 ? [...formData.history].reverse().map((h, i) => (
                  <div key={i} className="relative pl-4 border-l-2 border-black/5">
                    <div className="absolute top-1.5 left-[-5px] w-2.5 h-2.5 rounded-full bg-white border-2 border-black/10" />
                    <p className="text-[9px] uppercase tracking-wider text-black/40 font-bold mb-1">{safeFormat(h.date, 'MMM dd, HH:mm')}</p>
                    <div className="text-xs font-semibold text-black/80 leading-relaxed">
                      {h.note}
                    </div>
                  </div>
                )) : (
                  <div className="h-40 lg:h-full flex flex-col items-center justify-center text-center opacity-30">
                     <p className="text-[9px] uppercase tracking-widest font-bold">No Activity</p>
                  </div>
                )}
           </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex flex-col gap-3 backdrop-blur-md bg-white/90 border-t border-black/5">
             <div className="mb-2 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-2">
                   <Calendar size={12} className="text-black transition-colors" />
                   <span className="text-[10px] font-bold uppercase tracking-wider text-black transition-colors">Next Reminder</span>
                </div>
                <input 
                  type="date" 
                  className="bg-black text-white rounded-lg px-3 md:px-4 py-2 text-[10px] font-bold uppercase focus:outline-none cursor-pointer shadow-lg border-none hover:scale-105 transition-transform"
                  style={{ colorScheme: 'dark' }}
                  value={formData.reminderDate}
                  onChange={(e) => updateField('reminderDate', e.target.value)}
                />
             </div>

             <div className="relative shadow-2xl shadow-black/25 rounded-xl bg-white border border-black/5">
                <textarea 
                  placeholder="Log activity..." 
                  className="w-full bg-transparent border-none rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-0 text-black placeholder:text-black/30 transition-all resize-none h-16 md:h-20"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      addHistoryNote();
                    }
                  }}
                />
             </div>
             <button 
               onClick={addHistoryNote}
               disabled={!newNote.trim()}
               className="w-full bg-black text-white py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all disabled:cursor-not-allowed disabled:text-white/50 shadow-2xl shadow-black/25 transform hover:-translate-y-0.5"
             >
               ADD TODAY'S ACTIVITY
             </button>
           </div>
         </div>
      </div>
    </div>
  );
};

export default LeadModal;
