import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, isSameDay, startOfToday, parseISO } from 'date-fns';

const Timeline = ({ dates, selectedDate, setSelectedDate, onDateJump, showAllDates, setShowAllDates }) => {
  const scrollContainerRef = useRef(null);
  const dateInputRef = useRef(null);
  const today = startOfToday();

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };

  const handleCalendarClick = () => {
    dateInputRef.current?.showPicker();
  };

  const handleDateChange = (e) => {
    if (e.target.value) {
      const newDate = parseISO(e.target.value);
      setShowAllDates(false);
      if (onDateJump) {
        onDateJump(newDate);
      } else {
        setSelectedDate(newDate);
      }
    }
  };

  const selectAll = () => {
    setShowAllDates(true);
  };

  const selectDate = (date) => {
    setShowAllDates(false);
    setSelectedDate(date);
  };

  const getDatePillClass = (date) => {
    const isToday = isSameDay(date, today);
    const isSelected = !showAllDates && isSameDay(date, selectedDate);

    if (isSelected) {
      return 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.12)]';
    }

    if (showAllDates && isToday) {
      return 'bg-black text-white/70 border-white/45 ring-1 ring-white/25';
    }

    return 'bg-black border-white/5 text-white/40 hover:bg-white/5 hover:text-white/60';
  };

  return (
    <section className="relative w-full min-w-0">
      <div className="flex items-center justify-between px-1 mb-2">
         <div className="flex items-center gap-3">
           <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
           <span className="text-[10px] font-medium text-white/20 uppercase tracking-[0.4em]">Engagement Tray</span>
         </div>

        <div className="flex gap-1.5 items-center shrink-0">
          <div 
             onClick={handleCalendarClick}
             className="p-1.5 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-all duration-200 active:scale-95 cursor-pointer relative"
             title="Jump to Date"
          >
            <CalendarIcon size={14} />
            <input 
              type="date" 
              ref={dateInputRef} 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
              onChange={handleDateChange}
            />
          </div>

          <button 
            onClick={() => scroll('left')} 
            className="p-1.5 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-all duration-200 active:scale-95"
          >
            <ChevronLeft size={14} />
          </button>
          <button 
            onClick={() => scroll('right')} 
            className="p-1.5 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-all duration-200 active:scale-95"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef} 
        className="flex gap-2 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth items-center py-1 max-h-[52px]"
      >
        <button
          type="button"
          onClick={selectAll}
          className={`flex flex-col items-center justify-center min-w-[44px] h-[44px] rounded-lg border transition-all duration-200 ease-out cursor-pointer shrink-0 ${
            showAllDates
              ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.12)]'
              : 'bg-black border-white/10 text-white/50 hover:bg-white/5 hover:text-white/80'
          }`}
        >
          <span className="text-[8px] font-bold uppercase tracking-wider">All</span>
        </button>

        {dates.map((date, i) => {
          const isToday = isSameDay(date, today);
          const isSelected = !showAllDates && isSameDay(date, selectedDate);
          const pillClass = getDatePillClass(date);
          
          return (
            <button
              type="button"
              key={i} 
              onClick={() => selectDate(date)} 
              className={`flex flex-col items-center justify-center min-w-[44px] h-[44px] rounded-lg border transition-all duration-200 ease-out cursor-pointer shrink-0 ${pillClass}`}
            >
              <span className={`text-[8px] font-medium uppercase leading-none ${
                isSelected ? 'text-black/50' : isToday && showAllDates ? 'text-white/50' : 'text-white/30'
              }`}>
                {format(date, 'eee')}
              </span>
              <span className="text-sm font-medium leading-tight">{format(date, 'd')}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default Timeline;
