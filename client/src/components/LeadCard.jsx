import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Globe, Star, ExternalLink, X } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { API_BASE, CARD_COLORS } from '../utils/data';
import { safeFormat } from '../utils/date';

import LeadModal from './LeadModal';

const LeadCard = ({ lead, onUpdate, index }) => {
  const [businessName, setBusinessName] = useState(lead.BusinessName);
  const [remarks, setRemarks] = useState(lead.Remarks);
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const history = JSON.parse(lead.CallHistory || '[]');

  useEffect(() => {
    setBusinessName(lead.BusinessName);
    setRemarks(lead.Remarks);
  }, [lead.BusinessName, lead.Remarks]);

  const isHighlighted = lead.Highlighted === 'TRUE';
  const cardColor = lead.Color || CARD_COLORS[index % CARD_COLORS.length];
  const isSpecialCategory = ['IT Services', 'Ad Agency'].includes(lead.Category);

  const handleUpdate = async (updates) => {
    setIsSaving(true);
    try {
      // Delegate update to parent (App.jsx) which handles optimistic UI and API call
      await onUpdate(updates);
    } catch (error) {
      console.error('Update failed', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleHighlight = (e) => {
    e.stopPropagation();
    handleUpdate({ highlighted: !isHighlighted });
  };

  return (
    <>
      <div 
        onClick={() => setIsExpanded(true)}
        className={`${cardColor} rounded-2xl p-1.5 transition-all duration-500 text-black shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-white/20 relative overflow-hidden group cursor-pointer flex flex-col`}
      >
        <div className="flex-1 bg-gradient-to-b from-white/90 via-white/70 to-white/50 backdrop-blur-sm rounded-2xl shadow-2xl p-4 flex flex-col gap-4">
          {/* Header */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <input 
                className="text-lg serif tracking-tight leading-tight flex-1 bg-transparent border-none focus:outline-none focus:bg-black/5 rounded-lg px-1 transition-all text-black font-medium truncate"
                value={businessName}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setBusinessName(e.target.value)}
                onBlur={() => businessName !== lead.BusinessName && handleUpdate({ name: businessName })}
                title={businessName}
              />
            </div>
            <button 
              onClick={toggleHighlight}
              className={`p-2 rounded-lg transition-all ${isHighlighted ? 'bg-black text-white' : 'bg-black/5 text-black/20 hover:text-black/40'}`}
            >
              <Star size={16} fill={isHighlighted ? 'currentColor' : 'none'} strokeWidth={1.5} />
            </button>
          </div>

          {/* Basic Info */}
          <div className="space-y-2">
            {lead.Phone && (
              <div className="flex items-center gap-2 text-xs text-black/80 font-semibold">
                <Phone size={12} className="opacity-60" />
                <span>{lead.Phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-black/80 font-semibold overflow-hidden">
              <Globe size={12} className="opacity-60" />
              <a href={lead.Website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="truncate flex-1 font-semibold hover:underline">
                 {lead.Website || 'Local Directory'}
              </a>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {lead.WebsiteStatus !== 'Live' && (
              <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
                lead.WebsiteStatus === 'broken' ? 'bg-red-500/20 text-red-700 border-red-500/10' : 
                lead.WebsiteStatus === 'missing' ? 'bg-orange-500/20 text-orange-700 border-orange-500/10' : 
                'bg-black/10 text-black/60 border-black/5'
              }`}>
                {lead.WebsiteStatus}
              </span>
            )}
          </div>

          {/* Summary (Latest Note) */}
          <div className={`flex-1 min-h-[50px] bg-white/50 rounded-xl p-3 text-[10px] text-black/80  italic leading-relaxed  ${(history.length > 0 || lead.Remarks || lead.ReminderDate) ? 'shadow-[inset_0_2px_6px_rgba(0,0,0,0.05)]' : ''}`}>
            {lead.ReminderDate && lead.ReminderDate === format(new Date(), 'yyyy-MM-dd') && lead.ReminderRemark ? (
               <span className="flex items-center gap-2 not-italic font-bold text-rose-600">
                 <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                 {lead.ReminderRemark}
               </span>
            ) : (
              history.length > 0 ? history[history.length - 1].note : (lead.Remarks || "Awaiting first tactical engagement...")
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-black/5 flex items-center justify-between mt-auto">
            <div className="flex flex-col">
               <div className="flex items-center gap-2">
                  <span className="text-[10px] text-black/60 font-bold">{lead.City}</span>
                  {lead.ReminderDate && (
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${
                      lead.ReminderDate === format(new Date(), 'yyyy-MM-dd') 
                        ? 'bg-rose-500/10 text-rose-600' 
                        : 'bg-black/5 text-black/50'
                    }`}>
                      {lead.ReminderDate === format(new Date(), 'yyyy-MM-dd') && (
                        <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                      )}
                      <span className="text-[8px] font-bold uppercase tracking-wider">
                        {lead.ReminderDate === format(new Date(), 'yyyy-MM-dd') 
                          ? 'TODAY' 
                          : safeFormat(lead.ReminderDate, 'MMM dd')}
                      </span>
                    </div>
                  )}
               </div>
               <span className="text-[8px] text-black/40 font-bold uppercase tracking-widest leading-none mt-1">
                 Sync: {safeFormat(lead.LastUpdated, 'dd MMM')}
               </span>
            </div>
            <a 
              href={lead.GoogleMapsLink} 
              target="_blank" 
              rel="noreferrer" 
              onClick={(e) => e.stopPropagation()} 
              className="p-2 bg-black/5 rounded-lg hover:bg-black/10 transition-all text-black/60 flex items-center gap-2 group border border-black/5"
              title="View on Google Maps"
            >
              <MapPin size={12} className="group-hover:text-red-600 transition-colors" />
              <span className="text-[9px] font-bold uppercase tracking-wide">Maps</span>
            </a>
          </div>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <LeadModal 
          lead={lead} 
          cardColor={cardColor}
          isSaving={isSaving}
          onClose={() => setIsExpanded(false)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
};

export default LeadCard;
