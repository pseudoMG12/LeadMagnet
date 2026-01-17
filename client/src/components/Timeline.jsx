import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay, startOfToday } from 'date-fns';

const Timeline = ({ dates, selectedDate, setSelectedDate, scrollContainerRef }) => {
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  return (
    <section className="space-y-0">
      <div className="flex items-center justify-between px-1">
         <div className="flex items-center gap-3">
           <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
           <span className="text-[10px] font-medium text-white/20 uppercase tracking-[0.4em]">Engagement Tray</span>
         </div>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="p-2 border border-white/5 rounded-xl text-white/20 hover:text-white hover:bg-white/5 transition-all">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll('right')} className="p-2 border border-white/5 rounded-xl text-white/20 hover:text-white hover:bg-white/5 transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef} 
        className="flex gap-4 overflow-x-auto no-scrollbar pb-0 scroll-smooth"
      >
        {dates.map((date, i) => {
          const isToday = isSameDay(date, startOfToday());
          const isActive = isSameDay(date, selectedDate);
          
          return (
            <div 
              key={i} 
              onClick={() => setSelectedDate(date)} 
              className={`flex flex-col items-center justify-center min-w-[55px] h-[60px] rounded-xl border transition-all cursor-pointer ${
                isToday 
                  ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.15)]' 
                  : isActive 
                    ? 'bg-white/10 border-white/20 text-white' 
                    : 'bg-black border-white/5 text-white/40 hover:bg-white/5'
              }`}
            >
              <span className={`text-[9px] font-medium uppercase tracking-tighter mb-0 ${isToday ? 'text-black/60' : 'text-white/30'}`}>
                {format(date, 'eee')}
              </span>
              <span className="text-base font-medium">{format(date, 'd')}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Timeline;
