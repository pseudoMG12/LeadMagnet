import React from 'react';
import { Zap, Grid2X2, Users, PieChart, FileText, Settings, Target, ChevronDown } from 'lucide-react';

const NavItem = ({ icon: Icon, label, active = false, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-300 w-full group ${
      active 
        ? 'bg-white text-black shadow-lg shadow-white/5' 
        : 'text-white/70 hover:text-white hover:bg-white/[0.03]'
    }`}
  >
    <Icon size={13} className={active ? 'text-black' : 'text-white/70 group-hover:text-white'} />
    <span className={`hidden lg:block text-xs font-medium ${active ? 'text-black' : ''}`}>
      {label}
    </span>
  </button>
);

const Sidebar = ({ activeView, setActiveView }) => {
  return (
    <aside className="w-16 lg:w-64 border-r border-white/5 flex flex-col p-4 bg-black z-50">
      {/* Brand */}
      <div className="flex items-center gap-3 px-3 py-6 mb-6">
        <div className="w-10 h-10 bg-white rounded-[1rem] flex items-center justify-center shrink-0">
          <Zap size={16} className="text-black fill-black" strokeWidth={2.5} />
        </div>
        <div className="hidden lg:flex flex-col">
          <span className="text-lg font-medium tracking-tight serif leading-tight text-white/90">LeadMagnet</span>
          <span className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium leading-none mt-1">Intelligence v2</span>
        </div>
      </div>
      
      {/* Nav */}
      <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
        <div className="space-y-4">
          <span className="hidden lg:block text-[10px] text-white/40 uppercase tracking-[0.4em] font-medium px-4">Workspace</span>
          <nav className="space-y-2">
            <NavItem 
              icon={Target} 
              label="Primary CRM" 
              active={activeView === 'crm'} 
              onClick={() => setActiveView('crm')} 
            />
            <NavItem 
              icon={Grid2X2} 
              label="Discovery" 
              active={activeView === 'discovery'} 
              onClick={() => setActiveView('discovery')} 
            />
            <NavItem icon={Users} label="Collaborators" />
          </nav>
        </div>

        <div className="space-y-4">
          <span className="hidden lg:block text-[10px] text-white/40 uppercase tracking-[0.4em] font-medium px-4">Analytics</span>
          <nav className="space-y-2">
            <NavItem icon={PieChart} label="Metrics" />
            <NavItem icon={FileText} label="Export Logs" />
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-white/5 space-y-4">
        <button className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.03] transition-all w-full">
           <Settings size={16} /> <span className="hidden lg:block text-xs font-medium">Config</span>
        </button>
        <div className="hidden lg:flex items-center justify-between px-3 py-2.5 bg-white/5 rounded-xl border border-white/5">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-medium">AS</div>
             <div className="flex flex-col">
               <span className="text-[11px] font-medium leading-none">Admin</span>
               <span className="text-[9px] text-white/20 mt-1 uppercase tracking-tighter">Pro Plan</span>
             </div>
           </div>
           <ChevronDown size={14} className="text-white/20" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
