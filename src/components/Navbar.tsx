import React from 'react';
import { 
  IconHome, IconWallet, IconCalendar, IconNote, IconSettings, 
  IconSheet, IconBot, IconGrid 
} from './icons/SvgIcons';

export type ActiveAppView = 'hub' | 'kosman' | 'finance' | 'activities' | 'notes' | 'worship';

interface NavbarProps {
  currentView: ActiveAppView;
  onNavigate: (view: ActiveAppView) => void;
  onOpenSettings: () => void;
  onOpenChatGPT: () => void;
  onOpenGoogleSheets: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenSettings,
  onOpenChatGPT,
  onOpenGoogleSheets,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFD000] border-b-2 sm:border-b-3 border-black px-2.5 sm:px-6 py-1.5 sm:py-2.5 comic-shadow">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Zone 1: Brand Wordmark (ManageMe!) & App Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button 
            onClick={() => onNavigate('hub')}
            className="flex items-center gap-1.5 sm:gap-2 text-left group focus:outline-none"
            title="ManageMe! Home Hub"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#FF4B82] border-2 border-black rounded-lg comic-shadow-sm flex items-center justify-center font-black text-white text-sm sm:text-base group-hover:rotate-6 transition-transform">
              M!
            </div>
            <div>
              <span className="font-display font-black text-base sm:text-2xl tracking-wide text-black block leading-none">
                ManageMe!
              </span>
            </div>
          </button>

          {/* 5-Module App Navigation Switcher */}
          <nav className="flex items-center gap-0.5 sm:gap-1 bg-white border sm:border-2 border-black p-0.5 sm:p-1 rounded-lg sm:rounded-xl comic-shadow-sm ml-1 sm:ml-2 overflow-x-auto scrollbar-none">
            
            <button
              onClick={() => onNavigate('hub')}
              className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black transition-all whitespace-nowrap ${
                currentView === 'hub'
                  ? 'bg-slate-900 text-white border border-black shadow-[1px_1px_0px_#000] sm:shadow-[2px_2px_0px_#000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              <IconGrid className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-1" />
              <span>Hub</span>
            </button>

            {/* Modul 1: KosMan */}
            <button
              onClick={() => onNavigate('kosman')}
              className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black transition-all whitespace-nowrap ${
                currentView === 'kosman'
                  ? 'bg-[#FF4B82] text-white border border-black shadow-[1px_1px_0px_#000] sm:shadow-[2px_2px_0px_#000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              <IconHome className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-1" />
              <span>KosMan</span>
            </button>

            {/* Modul 2: Keuangan */}
            <button
              onClick={() => onNavigate('finance')}
              className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black transition-all whitespace-nowrap ${
                currentView === 'finance'
                  ? 'bg-[#A3E635] text-black border border-black shadow-[1px_1px_0px_#000] sm:shadow-[2px_2px_0px_#000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              <IconWallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-1" />
              <span>Keuangan</span>
            </button>

            {/* Modul 3: Kegiatan & Perjalanan */}
            <button
              onClick={() => onNavigate('activities')}
              className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black transition-all whitespace-nowrap ${
                currentView === 'activities'
                  ? 'bg-[#00E5FF] text-black border border-black shadow-[1px_1px_0px_#000] sm:shadow-[2px_2px_0px_#000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              <IconCalendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-1" />
              <span>Kegiatan</span>
            </button>

            {/* Modul 4: Catatan */}
            <button
              onClick={() => onNavigate('notes')}
              className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black transition-all whitespace-nowrap ${
                currentView === 'notes'
                  ? 'bg-[#A855F7] text-white border border-black shadow-[1px_1px_0px_#000] sm:shadow-[2px_2px_0px_#000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              <IconNote className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-1" />
              <span>Catatan</span>
            </button>

            {/* Modul 5: Waktu Ibadah (Official Integration) */}
            <button
              onClick={() => onNavigate('worship')}
              className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black transition-all whitespace-nowrap ${
                currentView === 'worship'
                  ? 'bg-[#10B981] text-white border border-black shadow-[1px_1px_0px_#000] sm:shadow-[2px_2px_0px_#000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
              title="Waktu Ibadah & Jadwal Shalat"
            >
              <span className="inline-block mr-1">🕌</span>
              <span>Waktu Ibadah</span>
            </button>

          </nav>
        </div>

        {/* Zone 2: Fast Integration Actions & Settings Button */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Quick Action: ChatGPT */}
          <button
            onClick={onOpenChatGPT}
            className="comic-button bg-[#00E5FF] text-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border sm:border-2 border-black comic-shadow-sm font-bold text-[10px] sm:text-xs flex items-center gap-1"
            title="Buka ChatGPT Sync"
          >
            <IconBot className="w-3.5 h-3.5 text-black" />
            <span className="hidden md:inline">ChatGPT Sync</span>
          </button>

          {/* Quick Action: Google Sheets */}
          <button
            onClick={onOpenGoogleSheets}
            className="comic-button bg-[#A3E635] text-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border sm:border-2 border-black comic-shadow-sm font-bold text-[10px] sm:text-xs flex items-center gap-1"
            title="Integrasi & Ekspor Google Sheets"
          >
            <IconSheet className="w-3.5 h-3.5 text-black" />
            <span className="hidden md:inline">Google Sheets</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="comic-button bg-white text-black p-1 sm:p-1.5 rounded-lg sm:rounded-xl border sm:border-2 border-black comic-shadow-sm font-bold text-xs flex items-center justify-center hover:bg-slate-100"
            title="Pengaturan Aplikasi & Versi"
          >
            <IconSettings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
          </button>
        </div>

      </div>
    </header>
  );
};
