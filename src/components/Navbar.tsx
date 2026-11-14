import React, { useState } from 'react';
import {
  IconHome,
  IconWallet,
  IconCalendar,
  IconNote,
  IconSettings,
  IconSheet,
  IconBot,
  IconGrid,
  IconMoon,
} from './icons/SvgIcons';
import { PWAInstallButton } from './PWAInstallBanner';
import { Menu, X } from 'lucide-react';

export type ActiveAppView = 'hub' | 'kosman' | 'finance' | 'activities' | 'notes' | 'worship';

interface NavbarProps {
  currentView: ActiveAppView;
  activeUtilityPanel: 'none' | 'chatgpt' | 'sheets' | 'settings';
  onNavigate: (view: ActiveAppView) => void;
  onToggleUtilityPanel: (panel: 'chatgpt' | 'sheets' | 'settings') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  activeUtilityPanel,
  onNavigate,
  onToggleUtilityPanel,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNav = (view: ActiveAppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const getViewLabel = (view: ActiveAppView) => {
    switch (view) {
      case 'hub':
        return 'Hub OS';
      case 'kosman':
        return 'KosMan';
      case 'finance':
        return 'Keuangan';
      case 'activities':
        return 'Kegiatan';
      case 'notes':
        return 'Catatan';
      case 'worship':
        return 'Ibadah';
      default:
        return 'Menu';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFD000] border-b-2 border-black px-2 sm:px-6 py-1.5 sm:py-2 comic-shadow">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleMobileNav('hub')}
            className="flex items-center gap-1.5 group focus:outline-none"
            title="ManageMe! Home Hub"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#FF4B82] border border-black sm:border-2 rounded-md sm:rounded-lg comic-shadow-sm flex items-center justify-center font-black text-white text-xs sm:text-sm">
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-white border-2 border-black p-1 rounded-xl comic-shadow-sm ml-2">
            {[
              { id: 'hub', label: 'Hub', icon: IconGrid, activeBg: 'bg-slate-900 text-white' },
              { id: 'kosman', label: 'KosMan', icon: IconHome, activeBg: 'bg-[#FF4B82] text-white' },
              { id: 'finance', label: 'Keuangan', icon: IconWallet, activeBg: 'bg-[#A3E635] text-black' },
              { id: 'activities', label: 'Kegiatan', icon: IconCalendar, activeBg: 'bg-[#00E5FF] text-black' },
              { id: 'notes', label: 'Catatan', icon: IconNote, activeBg: 'bg-[#A855F7] text-white' },
              { id: 'worship', label: 'Waktu Ibadah', icon: IconMoon, activeBg: 'bg-[#10B981] text-white' },
            ].map((item) => {
              const IconComp = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id as ActiveAppView)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
                    isActive
                      ? `${item.activeBg} border border-black shadow-[1.5px_1.5px_0px_#000]`
                      : 'text-slate-700 hover:text-black hover:bg-slate-100'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5 inline mr-1" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Zone 2: Inline Panel Toggles & Mobile Burger */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <PWAInstallButton compact />

          <button
            type="button"
            onClick={() => onToggleUtilityPanel('chatgpt')}
            className={`comic-button px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-black comic-shadow-sm font-black text-[10px] sm:text-xs flex items-center gap-1 ${
              activeUtilityPanel === 'chatgpt' ? 'bg-black text-[#00E5FF]' : 'bg-[#00E5FF] text-black'
            }`}
            title="Buka ChatGPT & Salin Link Spreadsheet"
          >
            <IconBot className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">ChatGPT</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleUtilityPanel('sheets')}
            className={`comic-button px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-black comic-shadow-sm font-black text-[10px] sm:text-xs flex items-center gap-1 ${
              activeUtilityPanel === 'sheets' ? 'bg-black text-[#A3E635]' : 'bg-[#A3E635] text-black'
            }`}
            title="Set Spreadsheet Database"
          >
            <IconSheet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Set Sheet</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleUtilityPanel('settings')}
            className={`comic-button p-1 sm:p-1.5 rounded-md sm:rounded-lg border border-black comic-shadow-sm font-bold text-xs flex items-center justify-center ${
              activeUtilityPanel === 'settings' ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-100'
            }`}
            title="Pengaturan Aplikasi & Versi"
          >
            <IconSettings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden comic-button bg-black text-[#FFD000] p-1 rounded-md border border-black comic-shadow-sm font-black flex items-center gap-1 text-[10px] uppercase"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="text-[9px] font-black">{mobileMenuOpen ? 'Tutup' : 'Menu'}</span>
          </button>
        </div>
      </div>

      {/* Inline Downward Mobile Menu (Flows cleanly below top bar) */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 pt-2 border-t-2 border-black">
          <div className="bg-white border-2 border-black rounded-xl p-2 space-y-1.5 shadow-[3px_3px_0px_#000]">
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'hub', label: 'Hub OS', activeBg: 'bg-slate-900 text-white' },
                { id: 'kosman', label: 'KosMan', activeBg: 'bg-[#FF4B82] text-white' },
                { id: 'finance', label: 'Keuangan', activeBg: 'bg-[#A3E635] text-black' },
                { id: 'activities', label: 'Kegiatan', activeBg: 'bg-[#00E5FF] text-black' },
                { id: 'notes', label: 'Catatan', activeBg: 'bg-[#A855F7] text-white' },
                { id: 'worship', label: 'Ibadah', activeBg: 'bg-[#10B981] text-white' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleMobileNav(m.id as ActiveAppView)}
                  className={`p-2 rounded-lg border border-black font-black text-[11px] text-center ${
                    currentView === m.id ? m.activeBg : 'bg-[#FFFDF6] text-black'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
