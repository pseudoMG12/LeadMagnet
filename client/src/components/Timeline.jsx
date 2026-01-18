import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, isSameDay, startOfToday, parseISO } from 'date-fns';

const Timeline = ({ dates, selectedDate, setSelectedDate, onDateJump }) => {
  const scrollContainerRef = useRef(null);
  const dateInputRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };

  const handleCalendarClick = () => {
    dateInputRef.current?.showPicker();
  };

  const handleDateChange = (e) => {
    if (e.target.value) {
      const newDate = parseISO(e.target.value);
      if (onDateJump) {
        onDateJump(newDate);
      } else {
        setSelectedDate(newDate);
      }
    }
  };

  return (
    <section className="space-y-0 relative">
      <div className="flex items-center justify-between px-1">
         {/* Static Label (Left) */}
         <div className="flex items-center gap-3">
           <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
           <span className="text-[10px] font-medium text-white/20 uppercase tracking-[0.4em]">Engagement Tray</span>
         </div>

        {/* Controls (Right) */}
        <div className="flex gap-2 items-center">
          {/* Date Picker Button */}
          <div 
             onClick={handleCalendarClick}
             className="p-2 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-all active:scale-95 cursor-pointer relative"
             title="Jump to Date"
          >
            <CalendarIcon size={16} />
            <input 
              type="date" 
              ref={dateInputRef} 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
              onChange={handleDateChange}
            />
          </div>

          <button 
            onClick={() => scroll('left')} 
            className="p-2 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-all active:scale-95"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => scroll('right')} 
            className="p-2 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-all active:scale-95"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef} 
        className="flex gap-4 overflow-x-auto no-scrollbar pb-0 scroll-smooth items-center"
      >
        {dates.map((date, i) => {
          const isToday = isSameDay(date, startOfToday());
          const isActive = isSameDay(date, selectedDate);
          
          return (
            <div 
              key={i} 
              onClick={() => setSelectedDate(date)} 
              className={`flex flex-col items-center justify-center min-w-[55px] h-[60px] rounded-xl border transition-all cursor-pointer shrink-0 ${
                isToday 
                  ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.15)] scale-105' 
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
