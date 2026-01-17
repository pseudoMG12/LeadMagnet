import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Globe, Clock, Star, ExternalLink, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

const API_BASE = 'http://localhost:5000';

// Tailwind 50-shade colors with black text
const COLORS = [
  'bg-blue-50',
  'bg-green-50',
  'bg-pink-50',
  'bg-yellow-50',
  'bg-lime-50',
];

const LeadCard = ({ lead, onUpdate, index }) => {
  const [remarks, setRemarks] = useState(lead.Remarks);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setRemarks(lead.Remarks);
  }, [lead.Remarks]);

  const isHighlighted = lead.Highlighted === 'TRUE';
  const cardColor = COLORS[index % COLORS.length];

  const handleUpdate = async (updates) => {
    setIsSaving(true);
    try {
      await axios.patch(`${API_BASE}/lead/${lead.PlaceID}`, updates);
      onUpdate();
    } catch (error) {
      console.error('Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleHighlight = (e) => {
    e.stopPropagation();
    handleUpdate({ highlighted: !isHighlighted });
  };

  const handleBlur = () => {
    if (remarks !== lead.Remarks) {
      handleUpdate({ remarks });
    }
  };

  return (
    <div className={`card-container ${cardColor} flex flex-col gap-6 shadow-sm border-none`}>
      {/* Header: Name + Pin */}
      <div className="flex justify-between items-start gap-4">
        <h3 className="text-xl serif tracking-tight leading-tight flex-1 text-black">
          {lead.BusinessName}
        </h3>
        <button 
          onClick={toggleHighlight}
          className={`p-2 rounded-xl transition-all ${isHighlighted ? 'bg-black text-white' : 'bg-black/5 text-black/20 hover:text-black/40'}`}
        >
          <Star size={16} fill={isHighlighted ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>
      </div>

      {/* Basic Info - Black 60% for secondary data */}
      <div className="space-y-3">
        {lead.Phone && (
          <a href={`tel:${lead.Phone}`} className="flex items-center gap-2.5 text-xs text-black/60 hover:text-black transition-colors">
            <Phone size={12} className="opacity-40" />
            <span className="font-medium">{lead.Phone}</span>
          </a>
        )}
        <div className="flex items-center gap-2.5 text-xs text-black/60">
          <Globe size={12} className="opacity-40" />
          <span className="truncate flex-1 font-medium">{lead.Website || 'Local Directory'}</span>
        </div>
      </div>

      {/* Badges - Subtle dark overlays */}
      <div className="flex flex-wrap gap-2">
        <span className="px-2.5 py-1 rounded-full bg-black/5 text-[9px] font-medium uppercase tracking-wider text-black/40 border border-black/10">
          {lead.Category}
        </span>
        {lead.WebsiteStatus !== 'Live' && (
          <span className="px-2.5 py-1 rounded-full bg-black/10 text-[9px] font-medium uppercase tracking-wider text-black/60">
            {lead.WebsiteStatus === 'missing' ? 'No Website' : 'Broken Link'}
          </span>
        )}
      </div>

      {/* Remarks - Transparent Dark Textbox */}
      <div className="flex-1 min-h-[100px] flex flex-col gap-2">
        <label className="text-[9px] uppercase tracking-[0.2em] text-black/30 font-medium pl-1">CRM Intelligence</label>
        <textarea 
          className="flex-1 w-full bg-black/[0.03] border border-black/5 rounded-xl p-4 text-xs font-medium text-black placeholder:text-black/10 focus:outline-none focus:bg-black/[0.05] transition-all resize-none"
          placeholder="Intelligence log..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          onBlur={handleBlur}
        />
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-black/5 flex items-center justify-between">
        <div className="flex flex-col">
           <span className="text-[10px] text-black/40 font-medium">{lead.City}</span>
           <span className="text-[8px] text-black/20 font-medium uppercase tracking-widest leading-none">
             {format(new Date(lead.LastUpdated), 'dd MMM')}
           </span>
        </div>
        <div className="flex items-center gap-2">
          <a href={lead.GoogleMapsLink} target="_blank" rel="noreferrer" className="p-2 bg-black/5 rounded-lg hover:bg-black/10 transition-all text-black/40">
            <ExternalLink size={14} />
          </a>
          {isSaving && <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />}
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
