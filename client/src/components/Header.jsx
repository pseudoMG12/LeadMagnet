import React from 'react';
import { Target, Inbox, LayoutGrid, Table } from 'lucide-react';
import { format } from 'date-fns';

const Header = ({ selectedDate, activeTab, setActiveTab, viewMode, setViewMode, activeCount, todayCount, sortConfig, setSortConfig }) => {
  return (
    <header className="h-20 px-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl">
      <div className="flex items-center gap-6">
        <h2 className="text-2xl serif tracking-tight w-48 text-white/90">{format(selectedDate, 'MMMM yyyy')}</h2>
        
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('active')} 
            className={`px-6 py-2 rounded-xl text-[10px] font-medium transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-white/40 hover:text-white'}`}
          >
            <Target size={12} /> CRM ({activeCount})
          </button>
          <button 
            onClick={() => setActiveTab('today')} 
            className={`px-6 py-2 rounded-xl text-[10px] font-medium transition-all flex items-center gap-2 ${activeTab === 'today' ? 'bg-white text-rose-500 shadow-lg shadow-white/5' : 'text-rose-500/40 hover:text-rose-500'}`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> TODAY ({todayCount})
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setSortConfig({ key: 'BusinessName', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
            className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${sortConfig.key === 'BusinessName' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
          >
            Name {sortConfig.key === 'BusinessName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </button>
          <div className="w-[1px] bg-white/5 my-2" />
          <button 
            onClick={() => setSortConfig({ key: 'LastUpdated', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
            className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${sortConfig.key === 'LastUpdated' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
          >
            Recent {sortConfig.key === 'LastUpdated' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setViewMode('cards')} 
            className={`p-2.5 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white/10 text-white shadow-inner' : 'text-white/20 hover:text-white/40'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button 
            onClick={() => setViewMode('sheet')} 
            className={`p-2.5 rounded-lg transition-all ${viewMode === 'sheet' ? 'bg-white/10 text-white shadow-inner' : 'text-white/20 hover:text-white/40'}`}
          >
            <Table size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
