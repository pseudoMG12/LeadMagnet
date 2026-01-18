import React from 'react';
import { Target, Inbox, LayoutGrid, Table, Search, Menu } from 'lucide-react'; // Added Menu
import { CARD_COLORS } from '../utils/data';
import { format, isSameDay, startOfToday } from 'date-fns';

const Header = ({ selectedDate, setSelectedDate, activeTab, setActiveTab, viewMode, setViewMode, activeCount, todayCount, sortConfig, setSortConfig, filterColor, setFilterColor, searchQuery, setSearchQuery, toggleSidebar }) => { // Added toggleSidebar
  const isToday = isSameDay(selectedDate, startOfToday());

  return (
    <header className="h-16 lg:h-20 px-4 lg:px-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl shrink-0 gap-4">
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Mobile Menu Button */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 text-white/70 hover:text-white"
        >
          <Menu size={20} />
        </button>

        <h2 className="text-lg lg:text-2xl serif tracking-tight lg:w-48 text-white/90 whitespace-nowrap">
          {format(selectedDate, 'MMMM yyyy')}
        </h2>
        
        <div className="hidden md:flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('active')} 
            className={`px-4 lg:px-6 py-2 rounded-xl text-[10px] font-medium transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-white/40 hover:text-white'}`}
          >
            <Target size={12} /> <span className="hidden lg:inline">CRM</span> ({activeCount})
          </button>
          <button 
            onClick={() => {
              setActiveTab('today');
              setSelectedDate(startOfToday());
            }}
            className={`px-4 lg:px-6 py-2 rounded-xl text-[10px] font-medium transition-all flex items-center gap-2 ${activeTab === 'today' ? 'bg-white text-rose-500 shadow-lg shadow-white/5' : 'text-rose-500/40 hover:text-rose-500'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full bg-rose-500 ${isToday ? 'animate-pulse' : ''}`} /> 
            <span className="hidden lg:inline">{isToday ? 'TODAY' : format(selectedDate, 'MMM dd').toUpperCase()}</span> 
            <span className="lg:hidden">{isToday ? 'TDY' : format(selectedDate, 'dd')}</span>
            ({todayCount})
          </button>
        </div>
      </div>

      {/* Search Bar - Hidden on small mobile, visible on tablet+ */}
      <div className="hidden md:block flex-1 max-w-xl mx-4 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/50 transition-colors">
            <Search size={14} />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads..." 
            className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white/90 placeholder:text-white/20 focus:outline-none focus:bg-white/5 focus:border-white/10 transition-all font-medium"
          />
      </div>

      <div className="flex items-center gap-2 lg:gap-4 overflow-x-auto no-scrollbar mask-gradient-right">
        {/* Color Filter - Scrollable on mobile */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 items-center gap-1 shrink-0">
          <button
             onClick={() => setFilterColor(null)}
             className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${!filterColor ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
             title="All Colors"
          >
            <span className="text-[10px] font-bold">ALL</span>
          </button>
          {CARD_COLORS.map((color) => (
             <button
               key={color}
               onClick={() => setFilterColor(filterColor === color ? null : color)}
               className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${filterColor === color ? 'bg-white/20 ring-1 ring-white/50' : 'hover:bg-white/5'}`}
             >
               <div className={`w-3 h-3 rounded-full ${color}`} />
             </button>
           ))}
        </div>
        
        {/* Sort - Hidden on mobile to save space? Let's keep it visible on large screens, hidden on small */}
        <div className="hidden lg:flex bg-white/5 p-1 rounded-xl border border-white/5 shrink-0">
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

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 shrink-0">
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
