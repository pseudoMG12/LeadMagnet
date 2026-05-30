import React, { useState } from 'react';
import { LayoutGrid, Table, Search, Menu, X } from 'lucide-react';
import { CARD_COLORS } from '../utils/data';
import { format } from 'date-fns';

const Header = ({
  selectedDate,
  viewMode,
  setViewMode,
  sortConfig,
  setSortConfig,
  filterColor,
  setFilterColor,
  searchQuery,
  setSearchQuery,
  toggleSidebar,
}) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header className="h-16 lg:h-20 px-4 lg:px-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl shrink-0 gap-4 relative transition-all duration-300">
      
      {isMobileSearchOpen && (
        <div className="absolute inset-0 bg-[#0A0A0A]/95 z-50 flex items-center px-4 animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-md">
           <div className="flex-1 flex items-center bg-white/5 rounded-xl px-3 py-2.5 border border-white/5 mr-3 transition-all duration-300 focus-within:border-white/15 focus-within:bg-white/[0.07]">
             <Search size={16} className="text-white/30 mr-3 shrink-0" />
             <input 
               autoFocus
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search leads..." 
               className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none"
             />
             {searchQuery && (
               <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-white/10 rounded-full transition-all duration-200">
                 <X size={14} className="text-white/40" />
               </button>
             )}
          </div>
          <button 
            onClick={() => {
              setIsMobileSearchOpen(false);
              setSearchQuery(''); 
            }}
            className="text-xs font-semibold text-white/50 hover:text-white transition-colors duration-200 tracking-wide"
          >
            CANCEL
          </button>
        </div>
      )}

      <div className="flex items-center gap-4 lg:gap-6 min-w-0">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 text-white/70 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Menu size={20} />
        </button>

        <h2 className="text-lg lg:text-2xl serif tracking-tight text-white/90 whitespace-nowrap transition-opacity duration-300">
          {format(selectedDate, 'MMMM yyyy')}
        </h2>
      </div>

      <div className="hidden md:block flex-1 max-w-xl mx-4 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/50 transition-colors duration-300">
            <Search size={14} />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads..." 
            className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white/90 placeholder:text-white/20 focus:outline-none focus:bg-white/5 focus:border-white/15 transition-all duration-300 font-medium"
          />
      </div>

      <div className="flex items-center gap-2 lg:gap-4 overflow-x-auto no-scrollbar">
        
        <button 
           onClick={() => setIsMobileSearchOpen(true)}
           className="md:hidden p-2 rounded-lg text-white/40 hover:text-white transition-all duration-200 hover:bg-white/5 active:scale-95"
        >
           <Search size={20} />
        </button>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 items-center gap-1 shrink-0">
          <button
             onClick={() => setFilterColor(null)}
             className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ease-out ${!filterColor ? 'bg-white/10 text-white scale-105' : 'text-white/20 hover:text-white/50 hover:bg-white/5'}`}
             title="All Colors"
          >
            <span className="text-[10px] font-bold">ALL</span>
          </button>
          {CARD_COLORS.map((color) => (
             <button
               key={color}
               onClick={() => setFilterColor(filterColor === color ? null : color)}
               className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ease-out ${filterColor === color ? 'bg-white/20 ring-1 ring-white/50 scale-110' : 'hover:bg-white/5 hover:scale-105'}`}
             >
               <div className={`w-3 h-3 rounded-full ${color} transition-transform duration-300`} />
             </button>
           ))}
        </div>
        
        <div className="hidden lg:flex bg-white/5 p-1 rounded-xl border border-white/5 shrink-0">
          <button 
            onClick={() => setSortConfig({ key: 'BusinessName', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
            className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${sortConfig.key === 'BusinessName' ? 'text-white bg-white/10' : 'text-white/20 hover:text-white/50'}`}
          >
            Name {sortConfig.key === 'BusinessName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </button>
          <div className="w-[1px] bg-white/5 my-2" />
          <button 
            onClick={() => setSortConfig({ key: 'LastUpdated', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
            className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${sortConfig.key === 'LastUpdated' ? 'text-white bg-white/10' : 'text-white/20 hover:text-white/50'}`}
          >
            Recent {sortConfig.key === 'LastUpdated' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 shrink-0">
          <button 
            onClick={() => setViewMode('cards')} 
            className={`p-2.5 rounded-lg transition-all duration-300 ease-out ${viewMode === 'cards' ? 'bg-white/10 text-white shadow-inner scale-105' : 'text-white/20 hover:text-white/50 hover:bg-white/5'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button 
            onClick={() => setViewMode('sheet')} 
            className={`p-2.5 rounded-lg transition-all duration-300 ease-out ${viewMode === 'sheet' ? 'bg-white/10 text-white shadow-inner scale-105' : 'text-white/20 hover:text-white/50 hover:bg-white/5'}`}
          >
            <Table size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
