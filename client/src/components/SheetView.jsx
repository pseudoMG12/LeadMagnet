import React, { useState } from 'react';
import { format, isValid } from 'date-fns';
import { safeFormat } from '../utils/date';
import LeadModal from './LeadModal';
import { CARD_COLORS } from '../utils/data';

const SheetView = ({ displayLeads, handleInlineUpdate, sortConfig, setSortConfig }) => {
  const [selectedLead, setSelectedLead] = useState(null);

  const toggleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
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
              <th className="w-[15%] text-[9px] text-white/40 uppercase tracking-[0.2em] px-6 py-5 font-medium">Operational Contact</th>
              <th 
                className="w-[15%] text-[9px] text-white/40 uppercase tracking-[0.2em] px-6 py-5 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort('City')}
              >
                Territory {sortConfig.key === 'City' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="w-[35%] text-[9px] text-white/40 uppercase tracking-[0.2em] px-6 py-5 font-medium">Strategic Intel</th>
              <th 
                className="w-[15%] text-[9px] text-white/40 uppercase tracking-[0.2em] px-6 py-5 text-right pr-12 font-medium cursor-pointer hover:text-white transition-colors"
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
                <td className="px-6 py-6 text-[12px] text-white/40 font-medium">{lead.Phone || 'System Null'}</td>
                <td className="px-6 py-6 text-[12px] text-white/40 uppercase tracking-tighter font-medium">{lead.City}</td>
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
          onClose={() => setSelectedLead(null)}
          onUpdate={(updates) => handleInlineUpdate(selectedLead.lead.PlaceID, updates)}
        />
      )}
    </div>
  );
};

export default SheetView;
