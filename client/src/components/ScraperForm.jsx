import React, { useState } from 'react';
import axios from 'axios';
import { Search, Loader2, MapPin, Tag } from 'lucide-react';
import { API_BASE } from '../utils/data';

const ScraperForm = ({ onComplete }) => {
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
        // Single Link Scrape
        const res = await axios.post(`${API_BASE}/scrape-link`, { url: mapLink });
        if (res.data.success) {
           setStatus(`Integrated: ${res.data.lead.name}`);
           setMapLink('');
           onComplete();
        } else {
           setStatus(res.data.message || 'No lead added.');
        }
      } else {
        // Bulk Scrape
        const categoryList = categories.split(',').map(c => c.trim()).filter(c => c);
        const res = await axios.post(`${API_BASE}/scrape`, { city, categories: categoryList });
        setStatus(`Integrated ${res.data.count} items.`);
        onComplete();
      }
    } catch (error) {
      console.error(error);
      setStatus('Error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black/20 border border-white/10 p-6 rounded-2xl relative overflow-hidden group space-y-4">
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
            className="flex-1 lg:flex-none bg-white/10 text-white border border-white/20 px-8 py-3.5 rounded-xl font-medium uppercase tracking-[0.1em] text-[10px] flex items-center justify-center gap-2 transition-all hover:bg-white hover:text-black hover:border-white active:scale-95 disabled:bg-white/5 disabled:text-white/40 h-full min-h-[44px]"
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
