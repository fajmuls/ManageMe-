import React, { useState } from 'react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';
import { IconDownload } from './icons/SvgIcons';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`comic-button bg-[#FF4B82] text-white border border-black comic-shadow-sm font-black uppercase flex items-center gap-1 whitespace-nowrap shrink-0 ${
          compact ? 'px-1.5 py-0.5 rounded-md text-[9px] sm:text-[11px]' : 'px-3 py-1.5 rounded-lg text-xs'
        }`}
        title="Pasang aplikasi ManageMe! ke layar utama Android/Desktop"
      >
        <IconDownload className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>{compact ? 'Install' : 'Install App (Android/PWA)'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <div className="inline-flex flex-col items-end">
        <button
          type="button"
          onClick={() => setShowIOSGuide((v) => !v)}
          className={`comic-button bg-white text-black border border-black comic-shadow-sm font-black uppercase flex items-center gap-1 whitespace-nowrap shrink-0 ${
            compact ? 'px-1.5 py-0.5 rounded-md text-[9px]' : 'px-3 py-1.5 rounded-lg text-xs'
          }`}
        >
          <IconDownload className="w-3 h-3" />
          <span>Install iOS</span>
        </button>

        {/* Inline accordion guide (No Pop-up Overlay) */}
        {showIOSGuide && (
          <div className="mt-1.5 w-64 rounded-xl bg-white border-2 border-black p-2.5 shadow-[3px_3px_0px_#000] space-y-2 text-left">
            <div className="flex items-center justify-between border-b border-black pb-1">
              <span className="text-[11px] font-black uppercase text-black">Pasang di iPhone / iPad</span>
              <button type="button" onClick={() => setShowIOSGuide(false)} className="font-bold text-xs">
                Tutup
              </button>
            </div>
            <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
              1. Ketuk tombol <strong>Share (Bagikan)</strong> di Safari.<br />
              2. Pilih <strong>Add to Home Screen</strong>.
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-2">
      <div className="rounded-lg bg-[#FFD000] border-2 border-black px-3 py-1.5 text-[11px] font-black text-black shadow-[2px_2px_0px_#000]">
        Mode Offline — Perubahan disimpan lokal browser & akan perlu disinkronkan saat online kembali.
      </div>
    </div>
  );
};
