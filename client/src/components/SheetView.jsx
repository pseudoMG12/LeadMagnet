import React, { useState } from 'react';
import { format, isValid } from 'date-fns';
import { safeFormat } from '../utils/date';
import LeadModal from './LeadModal';
import { CARD_COLORS } from '../utils/data';

const SheetView = ({ displayLeads, handleInlineUpdate, handleArchive, sortConfig, setSortConfig }) => {
  const [selectedLead, setSelectedLead] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const toggleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleUpdate = async (updates) => {
    setIsSaving(true);
    try {
      await handleInlineUpdate(selectedLead.lead.PlaceID, updates);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-black border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left table-fixed min-w-[1200px]">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 uppercase tracking-[0.1em]">
              <th 
                className="w-[20%] text-[9px] text-white/40 uppercase tracking-[0.2em] px-8 py-5 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort('BusinessName')}
              >
                Business Entity {sortConfig.key === 'BusinessName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="w-[12%] text-[9px] text-white/40 uppercase tracking-[0.2em] px-6 py-5 font-medium">Contact</th>
              <th 
                className="w-[12%] text-[9px] text-white/40 uppercase tracking-[0.2em] px-6 py-5 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort('City')}
              >
                Location {sortConfig.key === 'City' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="w-[15%] text-[9px] text-white/40 uppercase tracking-[0.2em] px-6 py-5 font-medium">Digital Assets</th>
              <th className="w-[25%] text-[9px] text-white/40 uppercase tracking-[0.2em] px-6 py-5 font-medium">Strategic Intel</th>
              <th 
                className="w-[16%] text-[9px] text-white/40 uppercase tracking-[0.2em] px-6 py-5 text-right pr-12 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort('LastUpdated')}
              >
                Database Sync {sortConfig.key === 'LastUpdated' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {displayLeads.map((lead, idx) => (
              <tr 
                key={lead.PlaceID} 
                className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                onClick={() => setSelectedLead({ lead, index: idx })}
              >
                <td className="px-8 py-6 truncate font-medium serif text-lg text-white/90">{lead.BusinessName}</td>
                <td className="px-6 py-6 text-[11px] text-white/40 font-medium font-mono">{lead.Phone || '-'}</td>
                <td className="px-6 py-6 text-[11px] text-white/40 uppercase tracking-tighter font-medium">{lead.City}</td>
                <td className="px-6 py-6">
                  <div className="flex flex-col gap-1.5">
                     <div className="flex items-center gap-2 text-[10px] text-white/60">
                        <span className="opacity-50 font-bold tracking-wider">IG:</span>
                        <span className="font-mono text-white/80 truncate max-w-[120px]">{lead.Instagram || '-'}</span>
                     </div>
                     <div className="flex items-center gap-2 text-[10px] text-white/60">
                        <span className="opacity-50 font-bold tracking-wider">WEB:</span>
                         {lead.Website ? (
                           <a href={lead.Website} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-blue-400 hover:underline truncate max-w-[120px]">
                             {lead.Website}
                           </a>
                         ) : (
                           <span className="text-red-500/50 font-bold">✕</span>
                         )}
                     </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-[11px] text-white/30 truncate font-medium">
                    {lead.Remarks || 'Awaiting engagement notes...'}
                  </div>
                </td>
                <td className="px-6 py-6 text-[11px] text-white/20 text-right pr-12 font-medium">
                  {safeFormat(lead.LastUpdated, 'dd MMM yyyy')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLead && (
        <LeadModal 
          lead={selectedLead.lead}
          cardColor={CARD_COLORS[selectedLead.index % CARD_COLORS.length]}
          isSaving={isSaving}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdate}
          onArchive={(archived) => handleArchive(selectedLead.lead.PlaceID, archived)}
        />
      )}
    </div>
  );
};

export default SheetView;
