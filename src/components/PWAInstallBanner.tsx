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
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`comic-button bg-white text-black border border-black comic-shadow-sm font-black uppercase flex items-center gap-1 whitespace-nowrap shrink-0 ${
            compact ? 'px-1.5 py-0.5 rounded-md text-[9px]' : 'px-3 py-1.5 rounded-lg text-xs'
          }`}
        >
          <IconDownload className="w-3 h-3" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000] space-y-3">
              <div className="flex items-center justify-between border-b border-black pb-2">
                <h3 className="text-sm font-black uppercase text-black">Pasang di iPhone / iPad</h3>
                <button onClick={() => setShowIOSGuide(false)} className="font-bold text-xs">✕</button>
              </div>
              <p className="text-xs font-bold text-slate-700 leading-relaxed">
                1. Ketuk tombol <strong>Share (Bagikan)</strong> di bilah Safari.<br />
                2. Gulir ke bawah lalu pilih <strong>Add to Home Screen (Tambah ke Layar Utama)</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-lg bg-[#FFD000] border border-black py-1.5 text-xs font-black text-black uppercase"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-1.5 rounded-lg bg-[#FFD000] border border-black px-2.5 py-1 text-[10px] font-black text-black shadow-[2px_2px_0px_#000]">
      <span>Mode Offline — Menggunakan data lokal browser</span>
    </div>
  );
};
