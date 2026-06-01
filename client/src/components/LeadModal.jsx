import React, { useState, useEffect, useRef } from 'react';
import { Phone, Globe, ExternalLink, X, MapPin, Instagram, Calendar, Activity, Check, Cloud } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { safeFormat } from '../utils/date';

import { CARD_COLORS, PIPELINE_STAGES, matchesPipelineStage } from '../utils/data';

/** Starred is set from the small card star only — not in the modal */
const MODAL_PIPELINE_OPTIONS = [
  { value: '', label: 'None' },
  { value: PIPELINE_STAGES.UNDER_PROCESS, label: 'Under Process' },
  { value: PIPELINE_STAGES.COMPLETED, label: 'Completed' },
];

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
    pipelineStage: lead.PipelineStage || '',
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

  // Sync local state when the lead prop changes (e.g. from a background refresh or status update entry)
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
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
      pipelineStage: lead.PipelineStage || '',
      history: JSON.parse(lead.CallHistory || '[]')
    }));
  }, [lead.PlaceID, lead.CallHistory, lead.Remarks, lead.CallStatus, lead.PipelineStage]);

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
    
    // CRITICAL: Only send fields that actually CHANGED compared to the current prop 'lead'
    // This prevents race conditions from overwriting unrelated fields with stale modal state.
    const updates = {};
    
    if (dataToSave.name !== lead.BusinessName) updates.name = dataToSave.name;
    if (dataToSave.phone !== lead.Phone) updates.phone = dataToSave.phone;
    if (dataToSave.city !== lead.City) updates.city = dataToSave.city;
    if (dataToSave.instagram !== (lead.Instagram || '')) updates.instagram = dataToSave.instagram;
    if (dataToSave.website !== (lead.Website || '')) updates.website = dataToSave.website;
    if (dataToSave.telecaller !== (lead.Telecaller || '')) updates.telecaller = dataToSave.telecaller;
    if (dataToSave.callStatus !== (lead.CallStatus || 'Not Contacted')) updates.callStatus = dataToSave.callStatus;
    if (dataToSave.remarks !== (lead.Remarks || '')) updates.remarks = dataToSave.remarks;
    if (dataToSave.reminderDate !== (lead.ReminderDate || '')) updates.reminderDate = dataToSave.reminderDate;
    if (dataToSave.reminderRemark !== (lead.ReminderRemark || '')) updates.reminderRemark = dataToSave.reminderRemark;
    if (dataToSave.color !== (lead.Color || initialColor)) updates.color = dataToSave.color;
    if (dataToSave.pipelineStage !== (lead.PipelineStage || '')) updates.pipelineStage = dataToSave.pipelineStage;
    
    // For history, only send if we explicitly provided it (meaning a note was added)
    if (overrides.history) {
      updates.callHistory = JSON.stringify(overrides.history);
    }

    if (Object.keys(updates).length === 0) {
      setSaveStatus('idle');
      return;
    }

    setSaveStatus('saving');
    
    try {
      await onUpdate(updates);
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

  const setPipelineStage = async (stage) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const prev = formData.pipelineStage;
    updateField('pipelineStage', stage);
    if (stage === prev) return;
    setSaveStatus('saving');
    try {
      await onUpdate({ pipelineStage: stage });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Pipeline save failed', error);
    }
  };

  const handleManualSave = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    performSave();
  };

  const addHistoryNote = () => {
    if (!newNote.trim()) return;
    
    const newEntry = { date: new Date().toISOString(), note: newNote.trim() };
    const updatedHistory = [...formData.history, newEntry];
    
    // Update local state first
    setFormData(prev => ({ 
      ...prev, 
      history: updatedHistory,
      reminderRemark: newNote.trim()
    }));
    
    setNewNote('');
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    // Force save specifically with the new history
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
        className={`${formData.color} w-full h-full md:h-[90vh] md:max-w-[75rem] md:rounded-3xl p-2 md:p-3 relative shadow-2xl border flex flex-col lg:flex-row gap-3 transition-all duration-500 ease-out overflow-y-auto lg:overflow-hidden animate-in zoom-in-95 fade-in duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white text-black rounded-full border border-black/5 hover:scale-110 transition-transform z-50 shadow-xl"
        >
          <X size={20} strokeWidth={2} />
        </button>

        {/* --- LEFT PANEL --- */}
         <div className="flex flex-col flex-1 min-h-0 lg:flex-[2] lg:h-full bg-gradient-to-b from-white via-white/85 to-white/70 rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-2xl text-black overflow-y-auto lg:overflow-hidden">
           
           <div className="space-y-3 shrink-0">
               <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-black/40 font-bold">Business Entity</span>
                    {getStatusIcon()}
                  </div>
                  <div className="flex items-center gap-1.5 md:mr-10 shrink-0">
                    {CARD_COLORS.map((c) => (
                       <button 
                         key={c}
                         onClick={(e) => { e.stopPropagation(); updateField('color', c); }}
                         className={`w-4 h-4 rounded-full border border-black/10 transition-all ${c} ${formData.color === c ? 'ring-2 ring-black/30 scale-110' : 'opacity-70 hover:opacity-100'}`}
                         title="Set Color"
                       />
                     ))}
                  </div>
               </div>
               <input 
                 className="w-full text-xl md:text-2xl serif tracking-tight leading-snug bg-transparent border-none focus:outline-none placeholder:text-black/15 text-black font-medium"
                 value={formData.name}
                 onChange={(e) => updateField('name', e.target.value)}
                 placeholder="Business Name"
               />
               
               <div className="space-y-1.5">
                 <span className="text-[9px] uppercase tracking-[0.3em] text-black/40 font-bold">Pipeline Stage</span>
                 <div className="flex flex-wrap gap-1.5">
                   {MODAL_PIPELINE_OPTIONS.filter((opt) => {
                     if (opt.value === '' && matchesPipelineStage(formData.pipelineStage, PIPELINE_STAGES.STARRED)) {
                       return false;
                     }
                     return true;
                   }).map((opt) => {
                     const isActive =
                       opt.value === ''
                         ? !formData.pipelineStage?.trim()
                         : formData.pipelineStage === opt.value;
                     return (
                     <button
                       key={opt.value || 'none'}
                       type="button"
                       onClick={(e) => { e.stopPropagation(); setPipelineStage(opt.value); }}
                       className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all duration-200 ${
                         isActive
                           ? 'bg-black text-white border-black shadow-sm'
                           : 'bg-white/70 text-black/55 border-black/10 hover:border-black/20 hover:bg-white'
                       }`}
                     >
                       {opt.label}
                     </button>
                   );})}
                 </div>
               </div>

               <div className="flex flex-wrap gap-2">
                 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/5 rounded-full text-[10px] font-bold uppercase tracking-wide text-black/50">
                    <MapPin size={11} className="opacity-50" />
                    <a href={lead.GoogleMapsLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-black/70 hover:text-black hover:underline">Maps</a>
                 </span>
                 {formData.website && (
                   <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/5 rounded-full text-[10px] font-bold uppercase tracking-wide text-black/50">
                     <Globe size={11} className="opacity-50" />
                     <a href={formData.website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-black/70 hover:text-black hover:underline">Website</a>
                   </span>
                 )}
               </div>

           <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="bg-black/[0.04] rounded-xl px-3 py-2 group hover:bg-black/[0.07] transition-colors">
                  <div className="flex items-center gap-1.5 text-black/40 mb-0.5">
                      <MapPin size={11} />
                      <span className="text-[8px] font-bold uppercase tracking-wider">Location</span>
                  </div>
                  <input 
                    className="w-full bg-transparent border-none p-0 text-[13px] leading-tight font-semibold text-black focus:outline-none placeholder:text-black/25"
                    placeholder="Add City..."
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
              </div>

              <div className="bg-black/[0.04] rounded-xl px-3 py-2 group hover:bg-black/[0.07] transition-colors">
                  <div className="flex items-center gap-1.5 text-black/40 mb-0.5">
                      <Phone size={11} />
                      <span className="text-[8px] font-bold uppercase tracking-wider">Contact</span>
                  </div>
                  <input 
                    className="w-full bg-transparent border-none p-0 text-[13px] leading-tight font-semibold text-black focus:outline-none placeholder:text-black/25"
                    placeholder="Add Phone..."
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
              </div>

              <div className="bg-black/[0.04] rounded-xl px-3 py-2 group hover:bg-black/[0.07] transition-colors">
                  <div className="flex items-center gap-1.5 text-black/40 mb-0.5">
                        <Instagram size={11} />
                        <span className="text-[8px] font-bold uppercase tracking-wider">Instagram</span>
                  </div>
                  <input 
                    className="w-full bg-transparent border-none p-0 text-[13px] leading-tight font-semibold text-black focus:outline-none placeholder:text-black/25"
                    placeholder="@username"
                    value={formData.instagram}
                    onChange={(e) => updateField('instagram', e.target.value)}
                  />
              </div>

               <div className="bg-black/[0.04] rounded-xl px-3 py-2 group hover:bg-black/[0.07] transition-colors relative">
                  <div className="flex items-center justify-between text-black/40 mb-0.5">
                      <div className="flex items-center gap-1.5">
                         <Globe size={11} />
                         <span className="text-[8px] font-bold uppercase tracking-wider">Website</span>
                      </div>
                      {formData.website && <a href={formData.website} target="_blank" rel="noreferrer" className="p-0.5 hover:bg-black/10 rounded-full"><ExternalLink size={11} /></a>}
                  </div>
                  <input 
                    className="w-full bg-transparent border-none p-0 text-[13px] leading-tight font-semibold text-black focus:outline-none placeholder:text-black/25"
                    placeholder="https://..."
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                  />
              </div>

              <div className="bg-black/[0.04] rounded-xl px-3 py-2 group hover:bg-black/[0.07] transition-colors">
                  <div className="flex items-center gap-1.5 text-black/40 mb-0.5">
                      <ExternalLink size={11} className="rotate-90" />
                      <span className="text-[8px] font-bold uppercase tracking-wider">Status</span>
                  </div>
                  <select 
                     className="w-full bg-transparent border-none p-0 text-[13px] leading-tight font-semibold text-black focus:outline-none cursor-pointer appearance-none"
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

               <div className="bg-black/[0.04] rounded-xl px-3 py-2 group hover:bg-black/[0.07] transition-colors">
                   <div className="flex items-center gap-1.5 text-black/40 mb-0.5">
                       <Activity size={11} />
                       <span className="text-[8px] font-bold uppercase tracking-wider">Assignee</span>
                   </div>
                   <input 
                     className="w-full bg-transparent border-none p-0 text-[13px] leading-tight font-semibold text-black focus:outline-none placeholder:text-black/25"
                     placeholder="Select Telecaller..."
                     value={formData.telecaller}
                     onChange={(e) => updateField('telecaller', e.target.value)}
                   />
               </div>

           </div>
           </div>

           <div className="flex flex-col flex-1 min-h-0 pt-3 mt-2 border-t border-black/[0.06]">
               <div className="flex justify-between items-center gap-2 mb-2 shrink-0">
                   <span className="text-[9px] uppercase tracking-[0.3em] text-black/40 font-bold">Internal Intelligence</span>
                   {formData.reminderRemark && (
                     <span className="text-[8px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 truncate max-w-[50%]">
                       Sync: {formData.reminderRemark}
                     </span>
                   )}
               </div>
               
               <div className="flex flex-col flex-1 min-h-[120px] lg:min-h-0 rounded-xl overflow-hidden bg-white/80 shadow-md border border-black/[0.04] focus-within:bg-white focus-within:ring-1 focus-within:ring-black/10">
                  <textarea 
                     className="flex-1 min-h-0 w-full p-3 text-sm font-medium text-black placeholder:text-black/25 focus:outline-none resize-none leading-relaxed custom-scrollbar-black overflow-y-auto bg-transparent"
                     placeholder="Strategic remarks and intelligence..."
                     value={formData.remarks}
                     onChange={(e) => updateField('remarks', e.target.value)}
                  />
                  
                  <div className="shrink-0 flex justify-end px-3 py-2 border-t border-black/[0.06] bg-white/95">
                    <button 
                      onClick={handleManualSave}
                      disabled={saveStatus === 'saving'}
                      className="px-4 py-1.5 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-black/85 active:scale-95 transition-all shadow-sm flex items-center gap-2"
                    >
                      {saveStatus === 'saving' ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <span>Save</span>}
                    </button>
                  </div>
               </div>
           </div>
         </div>

        {/* --- RIGHT PANEL: ACTIVITY LOG --- */}
         <div className="flex-none lg:flex-1 lg:h-full bg-white/80 rounded-2xl md:rounded-3xl relative shadow-2xl overflow-hidden text-black flex flex-col min-h-[320px] lg:min-h-0">
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

            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 flex flex-col gap-2 backdrop-blur-md bg-white/90 border-t border-black/5">
             <div className="mb-2 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-2">
                   <Calendar size={12} className="text-black transition-colors" />
                   <span className="text-[10px] font-bold uppercase tracking-wider text-black transition-colors">Next Reminder</span>
                </div>
                <div className="flex items-center gap-2">
                  {(formData.reminderDate || formData.reminderRemark) && (
                    <button
                      type="button"
                      title="Remove reminder"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (debounceTimer.current) clearTimeout(debounceTimer.current);
                        setFormData(prev => ({ ...prev, reminderDate: '', reminderRemark: '' }));
                        setSaveStatus('saving');
                        onUpdate({ reminderDate: '', reminderRemark: '' })
                          .then(() => { setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000); })
                          .catch(() => setSaveStatus('idle'));
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-500 text-[9px] font-bold uppercase tracking-wider hover:bg-red-100 hover:border-red-300 active:scale-95 transition-all"
                    >
                      <X size={10} strokeWidth={2.5} />
                      Strip
                    </button>
                  )}
                  <input 
                    type="date" 
                    className="bg-black text-white rounded-lg px-3 md:px-4 py-2 text-[10px] font-bold uppercase focus:outline-none cursor-pointer shadow-lg border-none hover:scale-105 transition-transform"
                    style={{ colorScheme: 'dark' }}
                    value={formData.reminderDate}
                    onChange={(e) => updateField('reminderDate', e.target.value)}
                  />
                </div>
             </div>

             <div className="relative shadow-2xl shadow-black/25 rounded-xl bg-white border border-black/5">
                <textarea 
                  placeholder="Log activity..." 
                  className="w-full bg-transparent border-none rounded-lg p-2 text-xs font-medium focus:outline-none focus:ring-0 text-black placeholder:text-black/30 resize-none h-14"
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
               className="w-full bg-black text-white py-2 rounded-lg text-[9px] font-bold uppercase tracking-[0.15em] hover:opacity-90 active:scale-95 transition-all disabled:cursor-not-allowed disabled:text-white/50"
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
