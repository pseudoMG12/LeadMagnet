import React, { useState } from 'react';
import axios from 'axios';
import { Search, Loader2, MapPin, Tag } from 'lucide-react';
import { API_BASE } from '../utils/data';

const ScraperForm = ({ onComplete, compact = false }) => {
  const [city, setCity] = useState('');
  const [categories, setCategories] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleScrape = async () => {
    if (!mapLink && (!city || !categories)) return;
    
    setIsLoading(true);
    setStatus('Mining...');

    try {
      if (mapLink) {
        const res = await axios.post(`${API_BASE}/scrape-link`, { url: mapLink });
        if (res.data.success) {
           setStatus(`Added: ${res.data.lead.name}`);
           setMapLink('');
           onComplete();
        } else {
           setStatus(res.data.message || 'No lead added.');
        }
      } else {
        const categoryList = categories.split(',').map(c => c.trim()).filter(c => c);
        const res = await axios.post(`${API_BASE}/scrape`, { city, categories: categoryList });
        setStatus(`Added ${res.data.count} leads.`);
        onComplete();
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || error.message || 'Harvest failed.';
      setStatus(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="bg-black/30 border border-white/10 p-4 rounded-xl h-full flex flex-col gap-3 transition-colors duration-300 hover:border-white/15">
        <div className="flex items-center gap-2 shrink-0">
          <Search size={12} className="text-white/30" />
          <span className="text-[9px] font-medium text-white/30 uppercase tracking-[0.3em]">Harvest</span>
        </div>
        <div className="space-y-2 flex-1 min-h-0">
          <input 
            disabled={!!mapLink}
            className={`w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-white/15 text-[11px] ${!!mapLink ? 'opacity-40' : ''}`}
            placeholder="City" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <input 
            disabled={!!mapLink}
            className={`w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-white/15 text-[11px] ${!!mapLink ? 'opacity-40' : ''}`}
            placeholder="Categories (comma)" 
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
          />
          <input 
            disabled={!!city || !!categories}
            className={`w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-white/15 text-[11px] ${(city || categories) ? 'opacity-40' : ''}`}
            placeholder="Maps link" 
            value={mapLink}
            onChange={(e) => setMapLink(e.target.value)}
          />
        </div>
        <button 
          disabled={isLoading || (!mapLink && (!city || !categories))}
          onClick={handleScrape}
          className="w-full bg-white/10 text-white border border-white/15 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 hover:bg-white hover:text-black disabled:opacity-40 shrink-0"
        >
          {isLoading ? <Loader2 className="animate-spin" size={12} /> : <><Search size={12} /><span>Harvest</span></>}
        </button>
        {status && (
          <p className="text-[8px] text-white/35 uppercase tracking-wide leading-snug line-clamp-2">{status}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-black/20 border border-white/10 p-6 rounded-2xl relative overflow-hidden group space-y-4 transition-all duration-300 hover:border-white/15">
      <div className="flex flex-col lg:flex-row gap-6 items-start relative z-10">
        <div className="flex-1 w-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <MapPin size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input 
                disabled={!!mapLink}
                className={`w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/70 focus:outline-none focus:border-white/20 transition-all font-medium text-xs shadow-inner ${!!mapLink ? 'opacity-30' : ''}`}
                placeholder="CityTarget (NY)" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="relative">
              <Tag size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input 
                disabled={!!mapLink}
                className={`w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/70 focus:outline-none focus:border-white/20 transition-all font-medium text-xs shadow-inner ${!!mapLink ? 'opacity-30' : ''}`}
                placeholder="Industries (Software)" 
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
              />
            </div>
          </div>
          
          <div className="relative flex items-center gap-4">
             <div className="h-[1px] flex-1 bg-white/5" />
             <span className="text-[9px] uppercase tracking-widest text-white/20 font-medium">OR</span>
             <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <div className="relative">
            <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              disabled={!!city || !!categories}
              className={`w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/70 focus:outline-none focus:border-white/20 transition-all font-medium text-xs shadow-inner ${(city || categories) ? 'opacity-30' : ''}`}
              placeholder="Paste Google Map Link (https://maps.app.goo.gl/...)" 
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full lg:w-auto flex flex-col items-stretch gap-4 pt-1">
          <button 
            disabled={isLoading || (!mapLink && (!city || !categories))}
            onClick={handleScrape}
            className="flex-1 lg:flex-none bg-white/10 text-white border border-white/20 px-8 py-3.5 rounded-xl font-medium uppercase tracking-[0.1em] text-[10px] flex items-center justify-center gap-2 transition-all duration-300 ease-out hover:bg-white hover:text-black hover:border-white active:scale-95 disabled:bg-white/5 disabled:text-white/40 h-full min-h-[44px]"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={14} strokeWidth={2} />
            ) : (
              <>
                <Search size={14} strokeWidth={2} />
                <span>Harvest Hub</span>
              </>
            )}
          </button>
          
          {status && (
            <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40 whitespace-nowrap px-4 py-2 border border-white/5 rounded-lg">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScraperForm;
