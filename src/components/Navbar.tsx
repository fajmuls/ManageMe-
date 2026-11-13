import React, { useState } from 'react';
import { 
  IconHome, IconWallet, IconCalendar, IconNote, IconSettings, 
  IconSheet, IconBot, IconGrid, IconMoon 
} from './icons/SvgIcons';
import { PWAInstallButton } from './PWAInstallBanner';
import { Menu, X, Sparkles } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNav = (view: ActiveAppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const getViewLabel = (view: ActiveAppView) => {
    switch (view) {
      case 'hub': return 'Hub OS';
      case 'kosman': return 'KosMan';
      case 'finance': return 'Keuangan';
      case 'activities': return 'Kegiatan';
      case 'notes': return 'Catatan';
      case 'worship': return 'Waktu Ibadah';
      default: return 'Menu';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFD000] border-b-2 sm:border-b-3 border-black px-2 sm:px-6 py-1.5 sm:py-2 comic-shadow">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Zone 1: Brand Wordmark & Active Badge */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button 
            onClick={() => handleMobileNav('hub')}
            className="flex items-center gap-1.5 group focus:outline-none"
            title="ManageMe! Home Hub"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#FF4B82] border border-black sm:border-2 rounded-md sm:rounded-lg comic-shadow-sm flex items-center justify-center font-black text-white text-xs sm:text-sm group-hover:rotate-6 transition-transform">
              M!
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-sm sm:text-xl tracking-wide text-black block leading-none">
                ManageMe!
              </span>
              <span className="bg-black text-[#FFD000] text-[9px] font-black px-1.5 py-0.2 rounded uppercase inline-block">
                {getViewLabel(currentView)}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Switcher (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-1 bg-white border-2 border-black p-1 rounded-xl comic-shadow-sm ml-2">
            <button
              onClick={() => onNavigate('hub')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
                currentView === 'hub'
                  ? 'bg-slate-900 text-white border border-black shadow-[1.5px_1.5px_0px_#000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              <IconGrid className="w-3.5 h-3.5 inline mr-1" />
              <span>Hub</span>
            </button>

            <button
              onClick={() => onNavigate('kosman')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
                currentView === 'kosman'
                  ? 'bg-[#FF4B82] text-white border border-black shadow-[1.5px_1.5px_0px_#000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              <IconHome className="w-3.5 h-3.5 inline mr-1" />
              <span>KosMan</span>
            </button>

            <button
              onClick={() => onNavigate('finance')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
                currentView === 'finance'
                  ? 'bg-[#A3E635] text-black border border-black shadow-[1.5px_1.5px_0px_#000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              <IconWallet className="w-3.5 h-3.5 inline mr-1" />
              <span>Keuangan</span>
            </button>

            <button
              onClick={() => onNavigate('activities')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
                currentView === 'activities'
                  ? 'bg-[#00E5FF] text-black border border-black shadow-[1.5px_1.5px_0px_#000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              <IconCalendar className="w-3.5 h-3.5 inline mr-1" />
              <span>Kegiatan</span>
            </button>

            <button
              onClick={() => onNavigate('notes')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
                currentView === 'notes'
                  ? 'bg-[#A855F7] text-white border border-black shadow-[1.5px_1.5px_0px_#000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              <IconNote className="w-3.5 h-3.5 inline mr-1" />
              <span>Catatan</span>
            </button>

            <button
              onClick={() => onNavigate('worship')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
                currentView === 'worship'
                  ? 'bg-[#10B981] text-white border border-black shadow-[1.5px_1.5px_0px_#000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              <IconMoon className="w-3.5 h-3.5 inline mr-1" />
              <span>Waktu Ibadah</span>
            </button>
          </nav>
        </div>

        {/* Zone 2: Action Tools & Mobile Burger Button */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          <PWAInstallButton compact />

          {/* Quick Action: ChatGPT */}
          <button
            onClick={onOpenChatGPT}
            className="comic-button bg-[#00E5FF] text-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-black comic-shadow-sm font-bold text-[10px] sm:text-xs flex items-center gap-1"
            title="Buka ChatGPT Sync"
          >
            <IconBot className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-black" />
            <span className="hidden sm:inline">ChatGPT</span>
          </button>

          {/* Quick Action: Google Sheets */}
          <button
            onClick={onOpenGoogleSheets}
            className="comic-button bg-[#A3E635] text-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-black comic-shadow-sm font-bold text-[10px] sm:text-xs flex items-center gap-1"
            title="Integrasi Google Sheets"
          >
            <IconSheet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-black" />
            <span className="hidden sm:inline">Sheets</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="comic-button bg-white text-black p-1 sm:p-1.5 rounded-md sm:rounded-lg border border-black comic-shadow-sm font-bold text-xs flex items-center justify-center hover:bg-slate-100"
            title="Pengaturan Aplikasi & Versi"
          >
            <IconSettings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
          </button>

          {/* Mobile Burger Menu Button (Visible on Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden comic-button bg-black text-[#FFD000] p-1 sm:p-1.5 rounded-md border border-black comic-shadow-sm font-black flex items-center gap-1 text-[10px] uppercase"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="text-[9px] font-black">{mobileMenuOpen ? 'Tutup' : 'Menu'}</span>
          </button>

        </div>

      </div>

      {/* POP COMIC MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 pt-2 border-t-2 border-black animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="bg-white border-2 border-black rounded-xl p-2.5 comic-shadow-lg space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-black">
              <span className="text-[10px] font-black uppercase text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#FFD000]" />
                Pilih Modul Aplikasi:
              </span>
              <span className="text-[9px] font-mono font-bold bg-[#FFD000] text-black px-1.5 py-0.2 rounded border border-black">
                ManageMe! OS
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              
              {/* Hub */}
              <button
                onClick={() => handleMobileNav('hub')}
                className={`p-2 rounded-lg border border-black font-black text-xs flex items-center gap-2 transition-all ${
                  currentView === 'hub' ? 'bg-slate-900 text-white shadow-[2px_2px_0px_#000]' : 'bg-[#FFFDF6] text-black hover:bg-slate-100'
                }`}
              >
                <IconGrid className="w-4 h-4 text-[#FFD000]" />
                <div className="text-left leading-none">
                  <span className="block text-xs">Hub Utama</span>
                  <span className="text-[8px] font-medium opacity-80">Dashboard OS</span>
                </div>
              </button>

              {/* KosMan */}
              <button
                onClick={() => handleMobileNav('kosman')}
                className={`p-2 rounded-lg border border-black font-black text-xs flex items-center gap-2 transition-all ${
                  currentView === 'kosman' ? 'bg-[#FF4B82] text-white shadow-[2px_2px_0px_#000]' : 'bg-[#FFFDF6] text-black hover:bg-slate-100'
                }`}
              >
                <IconHome className="w-4 h-4 text-[#FFD000]" />
                <div className="text-left leading-none">
                  <span className="block text-xs">KosMan</span>
                  <span className="text-[8px] font-medium opacity-80">Stok & Inventaris</span>
                </div>
              </button>

              {/* Keuangan */}
              <button
                onClick={() => handleMobileNav('finance')}
                className={`p-2 rounded-lg border border-black font-black text-xs flex items-center gap-2 transition-all ${
                  currentView === 'finance' ? 'bg-[#A3E635] text-black shadow-[2px_2px_0px_#000]' : 'bg-[#FFFDF6] text-black hover:bg-slate-100'
                }`}
              >
                <IconWallet className="w-4 h-4 text-black" />
                <div className="text-left leading-none">
                  <span className="block text-xs">Keuangan</span>
                  <span className="text-[8px] font-medium opacity-80">Cashflow & OCR</span>
                </div>
              </button>

              {/* Kegiatan */}
              <button
                onClick={() => handleMobileNav('activities')}
                className={`p-2 rounded-lg border border-black font-black text-xs flex items-center gap-2 transition-all ${
                  currentView === 'activities' ? 'bg-[#00E5FF] text-black shadow-[2px_2px_0px_#000]' : 'bg-[#FFFDF6] text-black hover:bg-slate-100'
                }`}
              >
                <IconCalendar className="w-4 h-4 text-black" />
                <div className="text-left leading-none">
                  <span className="block text-xs">Kegiatan</span>
                  <span className="text-[8px] font-medium opacity-80">Trip & Rutinitas</span>
                </div>
              </button>

              {/* Catatan */}
              <button
                onClick={() => handleMobileNav('notes')}
                className={`p-2 rounded-lg border border-black font-black text-xs flex items-center gap-2 transition-all ${
                  currentView === 'notes' ? 'bg-[#A855F7] text-white shadow-[2px_2px_0px_#000]' : 'bg-[#FFFDF6] text-black hover:bg-slate-100'
                }`}
              >
                <IconNote className="w-4 h-4 text-[#FFD000]" />
                <div className="text-left leading-none">
                  <span className="block text-xs">Catatan</span>
                  <span className="text-[8px] font-medium opacity-80">Brankas PIN & IG</span>
                </div>
              </button>

              {/* Waktu Ibadah */}
              <button
                onClick={() => handleMobileNav('worship')}
                className={`p-2 rounded-lg border border-black font-black text-xs flex items-center gap-2 transition-all ${
                  currentView === 'worship' ? 'bg-[#10B981] text-white shadow-[2px_2px_0px_#000]' : 'bg-[#FFFDF6] text-black hover:bg-slate-100'
                }`}
              >
                <IconMoon className="w-4 h-4 text-[#FFD000]" />
                <div className="text-left leading-none">
                  <span className="block text-xs">Waktu Ibadah</span>
                  <span className="text-[8px] font-medium opacity-80">Jadwal Shalat Web</span>
                </div>
              </button>

            </div>

            {/* Bottom Quick Tools */}
            <div className="pt-1 flex items-center gap-1.5 border-t border-slate-200">
              <button
                onClick={() => { onOpenChatGPT(); setMobileMenuOpen(false); }}
                className="flex-1 py-1.5 px-2 bg-[#00E5FF]/20 border border-black rounded-lg text-[10px] font-black text-black flex items-center justify-center gap-1"
              >
                <IconBot className="w-3 h-3 text-black" />
                <span>ChatGPT Sync</span>
              </button>
              <button
                onClick={() => { onOpenGoogleSheets(); setMobileMenuOpen(false); }}
                className="flex-1 py-1.5 px-2 bg-[#A3E635]/20 border border-black rounded-lg text-[10px] font-black text-black flex items-center justify-center gap-1"
              >
                <IconSheet className="w-3 h-3 text-black" />
                <span>Google Sheets</span>
              </button>
              <button
                onClick={() => { onOpenSettings(); setMobileMenuOpen(false); }}
                className="py-1.5 px-2.5 bg-slate-100 border border-black rounded-lg text-[10px] font-black text-black flex items-center justify-center gap-1"
              >
                <IconSettings className="w-3 h-3 text-black" />
                <span>Pengaturan</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </header>
  );
};
