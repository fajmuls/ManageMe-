import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Globe, ArrowUpRight, Maximize2, Minimize2, X, Sparkles } from 'lucide-react';

export function WorshipView() {
  const [iframeKey, setIframeKey] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(Date.now());
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-4 space-y-2 sm:space-y-3">
      
      {/* Sleek Ultra-Compact Top Control Bar */}
      <div className="bg-white border-2 border-black shadow-[2px_2px_0px_#000] rounded-xl p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
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
              Jadwal Shalat 5 Waktu, Imsakiyah, & Panduan Kiblat
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1 bg-[#00E5FF] hover:bg-cyan-300 text-black border border-black px-2.5 py-1 rounded-lg text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Buka Layar Penuh Bebas Cut-off"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Mode Layar Penuh</span>
          </button>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-black border border-black px-2 py-1 rounded-lg text-xs font-bold shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Muat ulang web"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Refresh</span>
          </button>

          <a
            href="https://waktuibadah.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-[#FFD000] hover:bg-yellow-400 text-black border border-black px-2.5 py-1 rounded-lg text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <span>Kunjungi</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Inline Responsive Web Preview Container */}
      <div className="bg-white border-2 border-black shadow-[3px_3px_0px_#000] rounded-xl overflow-hidden relative flex flex-col h-[calc(100vh-170px)] sm:h-[calc(100vh-190px)] min-h-[420px]">
        
        {/* Browser Header Bar */}
        <div className="bg-slate-900 text-white px-2.5 py-1 flex items-center justify-between border-b border-black text-[10px] font-mono shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#FF4B82]" />
            <span className="w-2 h-2 rounded-full bg-[#FFD000]" />
            <span className="w-2 h-2 rounded-full bg-[#A3E635]" />
            <span className="text-slate-300 ml-1 truncate">https://waktuibadah.vercel.app</span>
          </div>
          <button 
            onClick={() => setIsFullscreen(true)}
            className="text-[#00E5FF] hover:underline font-bold flex items-center gap-1 text-[10px]"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden xs:inline">Fullscreen</span>
          </button>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center p-4 space-y-2">
            <div className="w-8 h-8 border-3 border-black border-t-[#10B981] rounded-full animate-spin" />
            <p className="font-black text-xs text-black">Memuat waktuibadah.vercel.app...</p>
          </div>
        )}

        {/* Embedded Iframe */}
        <iframe
          key={iframeKey}
          src="https://waktuibadah.vercel.app"
          title="waktuibadah.vercel.app Web Preview"
          onLoad={() => setIsLoading(false)}
          className="w-full h-full flex-1 border-0 bg-white"
          allow="geolocation; autoplay; microphone"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
        />
      </div>

      {/* TRUE FULLSCREEN MODAL OVERLAY (100% UNCLIPPED SCREEN SPACE FOR WAKTU IBADAH) */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-150">
          
          {/* Fullscreen Top Control Ribbon */}
          <div className="bg-[#FFD000] border-b-2 border-black px-3 py-1.5 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm">🕌</span>
              <span className="font-black text-xs text-black truncate">waktuibadah.vercel.app — Mode Layar Penuh</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleRefresh}
                className="px-2 py-0.5 bg-white border border-black rounded text-[10px] font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>

              <a
                href="https://waktuibadah.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 bg-black text-white border border-black rounded text-[10px] font-bold flex items-center gap-1"
              >
                <span>Tab Baru</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => setIsFullscreen(false)}
                className="comic-button bg-[#FF4B82] text-white px-2.5 py-0.5 rounded border border-black font-black text-xs uppercase flex items-center gap-1 ml-1"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Tutup Fullscreen</span>
              </button>
            </div>
          </div>

          {/* Unclipped Full Viewport Iframe */}
          <div className="flex-1 w-full h-full relative bg-white">
            <iframe
              src="https://waktuibadah.vercel.app"
              title="waktuibadah.vercel.app Fullscreen"
              className="w-full h-full border-0 bg-white"
              allow="geolocation; autoplay; microphone"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
            />
          </div>

        </div>
      )}

    </div>
  );
}
