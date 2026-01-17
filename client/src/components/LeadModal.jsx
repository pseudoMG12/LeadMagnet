import React, { useState } from 'react';
import { Phone, Globe, Star, ExternalLink, X, MapPin } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { safeFormat } from '../utils/date';

const LeadModal = ({ lead, onClose, onUpdate, isSaving, cardColor }) => {
  const [businessName, setBusinessName] = useState(lead.BusinessName);
  const [phone, setPhone] = useState(lead.Phone);
  const [city, setCity] = useState(lead.City);
  const [telecaller, setTelecaller] = useState(lead.Telecaller || '');
  const [callStatus, setCallStatus] = useState(lead.CallStatus || 'Not Contacted');
  const [remarks, setRemarks] = useState(lead.Remarks);
  const [reminderDate, setReminderDate] = useState(lead.ReminderDate || '');
  const [reminderRemark, setReminderRemark] = useState(lead.ReminderRemark || '');
  const [newNote, setNewNote] = useState('');
  const [history, setHistory] = useState(JSON.parse(lead.CallHistory || '[]'));

  const handleSave = () => {
    onUpdate({
      name: businessName,
      phone: phone,
      city: city,
      telecaller: telecaller,
      callStatus: callStatus,
      remarks: remarks,
      reminderDate: reminderDate,
      reminderRemark: reminderRemark,
      callHistory: JSON.stringify(history)
    });
  };

  const addHistoryNote = () => {
    if (!newNote.trim()) return;
    const newEntry = { date: new Date().toISOString(), note: newNote.trim() };
    const updatedHistory = [...history, newEntry];
    setHistory(updatedHistory);
    // Auto-update the "Notes" (reminderRemark) with the latest entry for sheet visibility
    setReminderRemark(newNote.trim());
    setNewNote('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className={`${cardColor} w-full max-w-5xl rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 text-black relative shadow-[0_30px_100px_rgba(0,0,0,0.4)] border border-white/20 h-[90vh] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 bg-black/5 rounded-full hover:bg-black/10 transition-all active:scale-95 z-10"
        >
          <X size={24} />
        </button>

        {/* Left: Info & Strategy */}
        <div className="flex-1 space-y-6 overflow-y-auto pr-4 custom-scrollbar-black">
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-[0.4em] text-black/60 font-bold px-1">Lead Identity</span>
            <div className="flex items-center gap-3">
              <input 
                className="w-full text-3xl md:text-4xl serif tracking-tight leading-none bg-transparent border-none focus:outline-none focus:bg-black/5 rounded-lg px-1 transition-all min-w-0"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
              <a 
                href={lead.GoogleMapsLink} 
                target="_blank" 
                rel="noreferrer"
                className="p-3 bg-black/5 rounded-xl hover:bg-black/10 transition-all text-black/40 hover:text-red-500 shrink-0"
                title="Open in Maps"
              >
                <MapPin size={24} />
              </a>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span className="px-3 py-1 bg-white/40 rounded-full text-[9px] font-bold uppercase tracking-widest border border-black/5 shadow-sm">{lead.Category}</span>
              <div className="w-1 h-1 rounded-full bg-black/20" />
              <input 
                className="text-xs font-bold text-black/60 italic bg-transparent border-none focus:outline-none focus:bg-black/5 rounded-md px-1 transition-all"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-black/40 font-bold ml-1">Telecaller</span>
              <input 
                className="w-full bg-black/5 border border-black/5 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:bg-black/10 transition-all"
                value={telecaller}
                onChange={(e) => setTelecaller(e.target.value)}
                placeholder="Assign Telecaller"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-black/40 font-bold ml-1">Call Status</span>
              <select 
                className="w-full bg-black/5 border border-black/5 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:bg-black/10 transition-all appearance-none"
                value={callStatus}
                onChange={(e) => setCallStatus(e.target.value)}
              >
                <option value="Not Contacted">Not Contacted</option>
                <option value="Connected">Connected</option>
                <option value="Busy">Busy</option>
                <option value="Switch Off">Switch Off</option>
                <option value="Wrong Number">Wrong Number</option>
                <option value="Follow Up">Follow Up</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-black/5">
            <div className="space-y-1.5">
               <p className="text-[9px] uppercase tracking-widest text-black/50 font-bold ml-1">Contact Details</p>
               <div className="flex items-center gap-3 p-3 bg-white/40 backdrop-blur-sm rounded-xl hover:bg-white/50 transition-all group border border-white/30">
                 <Phone size={14} className="text-black/60 transition-colors" />
                 <input 
                    className="text-sm font-bold bg-transparent border-none focus:outline-none w-full"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                  />
               </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-[0.4em] text-black/60 font-bold ml-1">Main Strategic Remarks (Outcomes)</label>
              <textarea 
                className="w-full h-24 bg-black/5 border border-black/5 rounded-2xl p-4 text-sm font-medium text-black placeholder:text-black/10 focus:outline-none focus:bg-black/10 transition-all resize-none leading-relaxed shadow-inner"
                placeholder="Final determination for this lead..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <div className="bg-black/5 p-5 rounded-2xl space-y-4 border border-black/5">
              <div className="flex items-center justify-between">
                 <label className="text-[9px] uppercase tracking-[0.4em] text-black/40 font-bold ml-1">Next Engagement Schedule</label>
                 <input 
                   type="date" 
                   className="bg-transparent text-[10px] font-bold uppercase tracking-widest focus:outline-none"
                   value={reminderDate}
                   onChange={(e) => setReminderDate(e.target.value)}
                 />
              </div>
              <p className="text-[9px] text-black/30 font-bold uppercase ml-1">Notes in Sheet: {reminderRemark || 'No recent notes'}</p>
            </div>
          </div>
          
          <div className="flex justify-center pt-2">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-2 bg-black text-white rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] hover:opacity-90 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <div className="w-2.5 h-2.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Right: History Timeline */}
        <div className="w-full md:w-[380px] flex flex-col gap-6 bg-black/5 rounded-3xl p-6 border border-black/5 shadow-inner">
          <div className="flex items-center justify-between border-b border-black/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              <span className="text-[9px] uppercase tracking-[0.4em] text-black/40 font-medium">Detailed Engagement Log</span>
            </div>
            <span className="text-[9px] font-bold opacity-20 bg-black/10 px-2 py-1 rounded-md">{history.length} CARDS</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar-black">
            {history.length > 0 ? [...history].reverse().map((h, i) => (
              <div key={i} className="space-y-2 relative pl-6 border-l border-black/20 hover:border-black transition-colors">
                <div className="absolute top-1 left-[-4px] w-1.5 h-1.5 rounded-full bg-black/40 shadow-sm" />
                <p className="text-[9px] uppercase tracking-widest text-black/30 font-bold leading-none">{safeFormat(h.date, 'dd MMM yyyy HH:mm')}</p>
                <p className="text-xs font-medium leading-relaxed text-black/80 bg-white/40 p-4 rounded-2xl shadow-sm border border-white/20 whitespace-pre-wrap">{h.note}</p>
              </div>
            )) : (
              <div className="h-40 flex flex-col items-center justify-center text-center opacity-20 italic space-y-3">
                 <div className="w-10 h-10 border border-black/10 rounded-full flex items-center justify-center text-lg">?</div>
                 <p className="text-[10px] uppercase tracking-widest">Awaiting field intelligence.</p>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-black/10">
            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-[0.2em] text-black/30 font-bold px-1 text-center">New Engagement Entry</p>
              <textarea 
                placeholder="Log call details, portfolio sent, client feedback..." 
                className="w-full bg-white/60 border border-white/40 rounded-2xl p-4 text-xs font-semibold focus:outline-none focus:bg-white text-black placeholder:text-black/20 transition-all italic resize-none h-32 shadow-sm"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
            </div>
            <button 
              onClick={addHistoryNote}
              disabled={!newNote.trim()}
              className="w-full bg-black/10 text-black py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Append to Activity Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadModal;
