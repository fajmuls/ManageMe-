import React, { useState } from 'react';
import { RefreshCw, Globe, ArrowUpRight, Maximize2, Minimize2 } from 'lucide-react';
import { WorshipPref } from '../types/kosman';
import { IconCheck, IconMapPin } from './icons/SvgIcons';

interface WorshipViewProps {
  worshipPref: WorshipPref;
  onUpdateWorshipPref: (pref: WorshipPref) => void;
}

export function WorshipView({ worshipPref, onUpdateWorshipPref }: WorshipViewProps) {
  const [iframeKey, setIframeKey] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [cityInput, setCityInput] = useState<string>(worshipPref.city || 'Jakarta');
  const [savedNotice, setSavedNotice] = useState(false);

  const portalUrl = worshipPref.portalUrl || 'https://waktuibadah.vercel.app';

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(Date.now());
  };

  const handleSaveCity = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWorshipPref({
      city: cityInput.trim() || 'Jakarta',
      portalUrl,
      lastCheckedAt: new Date().toLocaleString('id-ID'),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2.5 sm:py-4 space-y-2.5">
      {/* Compact Control & City Sync Bar */}
      <div className="bg-white border-2 border-black shadow-[2px_2px_0px_#000] rounded-xl p-2.5 space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-[#10B981] border border-black rounded-lg shadow-[1px_1px_0px_#000] flex items-center justify-center shrink-0 text-white">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-xs text-black truncate">waktuibadah.vercel.app</span>
                <span className="bg-[#A3E635] text-black border border-black font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                  Official Web
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 truncate">
                Jadwal Shalat 5 Waktu, Imsakiyah, & Kiblat — Kota: {worshipPref.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsExpanded((v) => !v)}
              className="flex items-center gap-1 bg-[#00E5FF] hover:bg-cyan-300 text-black border border-black px-2.5 py-1 rounded-lg text-xs font-black shadow-[1.5px_1.5px_0px_#000]"
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isExpanded ? 'Perkecil Tinggi' : 'Perbesar Pratinjau'}</span>
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-black border border-black px-2 py-1 rounded-lg text-xs font-bold shadow-[1.5px_1.5px_0px_#000]"
              title="Muat ulang web"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">Refresh</span>
            </button>

            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-[#FFD000] hover:bg-yellow-400 text-black border border-black px-2.5 py-1 rounded-lg text-xs font-black shadow-[1.5px_1.5px_0px_#000]"
            >
              <span>Kunjungi Website</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Inline Kota Acuan -> Sync ke tab Waktu_Ibadah Spreadsheet */}
        <form onSubmit={handleSaveCity} className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-black/15">
          <IconMapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span className="text-[10px] font-black uppercase text-slate-700">Kota Acuan (Sync Sheet):</span>
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Jakarta, Bandung, Surabaya..."
            className="flex-1 min-w-[140px] max-w-xs px-2 py-1 border border-black rounded text-xs font-bold bg-[#FFFDF6]"
          />
          <button
            type="submit"
            className="px-2.5 py-1 bg-[#10B981] text-white border border-black rounded text-[11px] font-black uppercase flex items-center gap-1"
          >
            {savedNotice && <IconCheck className="w-3 h-3" />}
            <span>{savedNotice ? 'Tersimpan!' : 'Simpan & Sync'}</span>
          </button>
        </form>
      </div>

      {/* Inline Responsive Web Preview Container (Zero fixed inset-0 Pop-up) */}
      <div
        className={`bg-white border-2 border-black shadow-[3px_3px_0px_#000] rounded-xl overflow-hidden relative flex flex-col transition-all ${
          isExpanded ? 'h-[86vh] min-h-[580px]' : 'h-[calc(100vh-225px)] min-h-[430px]'
        }`}
      >
        <div className="bg-slate-900 text-white px-2.5 py-1 flex items-center justify-between border-b border-black text-[10px] font-mono shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#FF4B82]" />
            <span className="w-2 h-2 rounded-full bg-[#FFD000]" />
            <span className="w-2 h-2 rounded-full bg-[#A3E635]" />
            <span className="text-slate-300 ml-1 truncate">{portalUrl}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className="text-[#00E5FF] hover:underline font-bold flex items-center gap-1 text-[10px]"
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            <span>{isExpanded ? 'Normal' : 'Tinggi Maksimal'}</span>
          </button>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center p-4 space-y-2">
            <div className="w-7 h-7 border-2 border-black border-t-[#10B981] rounded-full animate-spin" />
            <p className="font-black text-xs text-black">Memuat {portalUrl}...</p>
          </div>
        )}

        <iframe
          key={iframeKey}
          src={portalUrl}
          title="waktuibadah.vercel.app Web Preview"
          onLoad={() => setIsLoading(false)}
          className="w-full h-full flex-1 border-0 bg-white"
          allow="geolocation; autoplay; microphone"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
        />
      </div>
    </div>
  );
}
