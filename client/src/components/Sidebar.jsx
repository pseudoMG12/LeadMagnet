import React from 'react';
import { Zap, Grid2X2, Target, ChevronDown, X, Calendar, Trash2, Star, Loader2, CheckCircle2 } from 'lucide-react';
import { PIPELINE_VIEWS } from '../utils/data';

const PIPELINE_ICONS = {
  starred: Star,
  under_process: Loader2,
  completed: CheckCircle2,
};

const NavItem = ({ icon: Icon, label, active = false, onClick, count }) => (
  <button 
    type="button"
    onClick={onClick}
    className={`flex items-center gap-3 w-full max-w-full px-3 py-2.5 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-white text-black shadow-md' 
        : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
    }`}
  >
    <Icon size={18} className={`shrink-0 ${active ? 'text-black' : 'text-white/70'}`} />
    <span className={`text-xs font-medium truncate flex-1 text-left ${active ? 'text-black' : ''}`}>
      {label}
    </span>
    {count != null && count > 0 && (
      <span className={`text-[10px] font-bold tabular-nums shrink-0 ${active ? 'text-black/50' : 'text-white/30'}`}>
        {count}
      </span>
    )}
  </button>
);

const Sidebar = ({ activeView, setActiveView, activeTab, setActiveTab, isOpen, setIsOpen, setShowAllDates, pipelineCounts = {} }) => {
  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-52 bg-black border-r border-white/5 flex flex-col p-4 shadow-2xl
      transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
      lg:relative lg:translate-x-0 lg:shadow-none lg:h-screen
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex items-center justify-between mb-6 px-2 pt-2 lg:pt-0 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shrink-0">
            <Zap size={20} className="text-black fill-black" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-lg font-medium tracking-tight serif leading-tight text-white/90 truncate">LeadMagnet</span>
          </div>
        </div>
        <button 
          type="button"
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 text-white/40 hover:text-white transition-all hover:bg-white/5 rounded-lg shrink-0"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden no-scrollbar min-h-0">
        <div className="space-y-2">
          <span className="text-[10px] text-white/40 uppercase tracking-[0.35em] font-medium px-2 block">Workspace</span>
          <nav className="space-y-1">
            <NavItem 
              icon={Target} 
              label="Primary CRM" 
              active={activeView === 'crm' && activeTab === 'active'} 
              onClick={() => { setActiveView('crm'); setActiveTab('active'); setShowAllDates?.(true); setIsOpen(false); }} 
            />
            <NavItem 
              icon={Calendar} 
              label="Today's Schedule" 
              active={activeView === 'crm' && activeTab === 'today'} 
              onClick={() => { setActiveView('crm'); setActiveTab('today'); setShowAllDates?.(false); setIsOpen(false); }} 
            />
            <NavItem 
              icon={Grid2X2} 
              label="Discovery" 
              active={activeView === 'discovery'} 
              onClick={() => { setActiveView('discovery'); setActiveTab('active'); setShowAllDates?.(true); setIsOpen(false); }} 
            />
            <NavItem 
              icon={Trash2} 
              label="Bin" 
              active={activeView === 'bin'} 
              onClick={() => { setActiveView('bin'); setIsOpen(false); }} 
            />
          </nav>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] text-white/40 uppercase tracking-[0.35em] font-medium px-2 block">Pipeline</span>
          <nav className="space-y-1">
            {PIPELINE_VIEWS.map(({ id, label }) => (
              <NavItem
                key={id}
                icon={PIPELINE_ICONS[id]}
                label={label}
                count={pipelineCounts[id]}
                active={activeView === id}
                onClick={() => {
                  setActiveView(id);
                  setActiveTab('active');
                  setShowAllDates?.(true);
                  setIsOpen(false);
                }}
              />
            ))}
          </nav>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5 shrink-0">
        <div className="flex items-center justify-between px-3 py-2.5 bg-white/5 rounded-xl border border-white/5">
           <div className="flex items-center gap-3 min-w-0">
             <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-medium shrink-0">AS</div>
             <div className="flex flex-col min-w-0">
               <span className="text-[11px] font-medium leading-none truncate">Admin</span>
               <span className="text-[9px] text-white/20 mt-1 uppercase tracking-tighter">Pro Plan</span>
             </div>
           </div>
           <ChevronDown size={14} className="text-white/20 shrink-0" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
