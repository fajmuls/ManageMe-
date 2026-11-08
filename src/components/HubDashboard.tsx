import React from 'react';
import { KosItem, FinanceRecord, RoutineActivity, MissedPrayer, NormalNote } from '../types/kosman';
import { 
  IconHome, IconWallet, IconCalendar, IconNote, 
  IconArrowRight, IconSparkles, IconBot, IconSheet 
} from './icons/SvgIcons';
import { ActiveAppView } from './Navbar';

interface HubDashboardProps {
  items: KosItem[];
  financeRecords: FinanceRecord[];
  routines: RoutineActivity[];
  prayers: MissedPrayer[];
  notes: NormalNote[];
  onNavigate: (view: ActiveAppView) => void;
  onOpenChatGPT: () => void;
  onOpenGoogleSheets: () => void;
  onOpenSettings: () => void;
}

export const HubDashboard: React.FC<HubDashboardProps> = ({
  items,
  financeRecords,
  routines,
  prayers,
  notes,
  onNavigate,
  onOpenChatGPT,
  onOpenGoogleSheets,
  onOpenSettings,
}) => {
  // KosMan stats
  const totalItems = items.length;
  const needBuyCount = items.filter(i => i.quantity <= i.minThreshold).length;

  // Finance stats
  let totalBalance = 0;
  let totalIncome = 0;
  let totalExpense = 0;
  financeRecords.forEach(r => {
    if (r.type === 'income') {
      totalBalance += r.amount;
      totalIncome += r.amount;
    } else {
      totalBalance -= r.amount;
      totalExpense += r.amount;
    }
  });

  // Daily stats
  const completedRoutines = routines.filter(r => r.completedToday).length;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2.5 sm:py-4 space-y-3 sm:space-y-4">
      
      {/* Pop Comic Hero Banner (Ultra Compact) */}
      <div className="bg-[#FFD000] border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-3 sm:p-5 comic-shadow relative overflow-hidden">
        <div className="absolute inset-0 bg-halftone pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
          <div className="lg:col-span-8 space-y-1.5 sm:space-y-2">
            
            <div className="inline-flex items-center gap-1 bg-black text-white px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider comic-shadow-sm">
              <IconSparkles className="w-3 h-3 text-[#FFD000]" />
              ManageMe! Life OS Hub
            </div>

            <h1 className="font-display font-black text-lg sm:text-2xl lg:text-3xl text-black leading-tight uppercase tracking-wide">
              PUSAT INTEGRASI <br className="hidden xs:inline" />
              <span className="bg-[#FF4B82] text-white px-2 py-0.5 rounded-lg border border-black inline-block transform -rotate-1 shadow-[2px_2px_0px_#000]">
                SEMUA APLIKASI
              </span> KOS & HARIAN!
            </h1>

            <p className="text-slate-900 font-bold text-[11px] sm:text-xs leading-snug max-w-2xl">
              Stok kosan (KosMan), arus kas & OCR nota, kegiatan harian, catatan brankas, serta jadwal shalat web dalam 1 layar.
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <button
                onClick={() => onNavigate('kosman')}
                className="comic-button bg-[#FF4B82] text-white font-black text-[10px] sm:text-xs px-3 py-1.5 rounded-lg border border-black comic-shadow-sm flex items-center gap-1 uppercase"
              >
                <IconHome className="w-3.5 h-3.5 text-white" />
                Buka KosMan
                <IconArrowRight className="w-3 h-3" />
              </button>

              <button
                onClick={() => onNavigate('finance')}
                className="comic-button bg-[#A3E635] text-black font-black text-[10px] sm:text-xs px-3 py-1.5 rounded-lg border border-black comic-shadow-sm flex items-center gap-1 uppercase"
              >
                <IconWallet className="w-3.5 h-3.5 text-black" />
                Keuangan
              </button>

              <button
                onClick={onOpenChatGPT}
                className="comic-button bg-[#00E5FF] text-black font-black text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg border border-black comic-shadow-sm flex items-center gap-1 uppercase"
              >
                <IconBot className="w-3.5 h-3.5 text-black" />
                ChatGPT
              </button>
            </div>
          </div>

          {/* Quick Stat Highlights */}
          <div className="lg:col-span-4 bg-white border-2 border-black rounded-xl p-2.5 sm:p-3 comic-shadow space-y-2">
            <h3 className="font-display font-black text-[11px] sm:text-xs uppercase border-b border-black pb-1 text-black flex items-center justify-between">
              <span>RINGKASAN SYSTEM</span>
              <span className="bg-[#A3E635] text-black text-[9px] px-1 py-0.2 rounded border border-black font-black">LOCAL DB</span>
            </h3>

            <div className="grid grid-cols-2 gap-1.5 text-center">
              <div className="bg-[#FFFDF6] border border-black p-1.5 rounded-lg">
                <span className="block text-base sm:text-lg font-black font-mono text-black leading-none">{totalItems}</span>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-700 uppercase">Katalog KosMan</span>
              </div>
              <div className="bg-[#FF4B82] text-white border border-black p-1.5 rounded-lg">
                <span className="block text-base sm:text-lg font-black font-mono leading-none">{needBuyCount}</span>
                <span className="text-[8px] sm:text-[9px] font-bold uppercase">Perlu Beli</span>
              </div>
            </div>

            <div className="bg-[#00E5FF] border border-black p-1.5 rounded-lg text-center">
              <span className="text-[9px] font-bold text-black uppercase block leading-none mb-0.5">Saldo Clean</span>
              <span className="text-xs sm:text-sm font-black font-mono text-black">
                Rp {totalBalance.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Apps Active Cards Grid (Ultra Compact Layout) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-black text-xs sm:text-sm uppercase tracking-wide text-black">
            MODUL UTAMA MANAGEME!
          </h2>
          <span className="text-[10px] font-bold text-slate-500">Klik modul untuk membuka</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          
          {/* Modul 1: KosMan */}
          <div className="bg-white border-2 border-black rounded-xl p-2.5 comic-shadow flex flex-col justify-between space-y-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 bg-[#FF4B82] border border-black rounded-lg comic-shadow-sm flex items-center justify-center text-white">
                  <IconHome className="w-3.5 h-3.5" />
                </div>
                <span className="text-[8px] font-black uppercase bg-[#FFFDF6] border border-black px-1 rounded text-slate-700">M1</span>
              </div>

              <div>
                <h3 className="font-display font-black text-xs text-black uppercase leading-tight">KosMan</h3>
                <p className="text-[9px] font-bold text-slate-600 line-clamp-2">
                  Stok bahan dapur & toilet.
                </p>
              </div>

              <div className="bg-[#FFFDF6] border border-black p-1 rounded-lg text-[9px] font-bold space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Stok:</span>
                  <span className="font-mono text-black">{totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Beli:</span>
                  <span className="font-mono text-red-600">{needBuyCount}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('kosman')}
              className="comic-button bg-[#FF4B82] text-white font-black text-[10px] uppercase py-1 rounded-lg border border-black comic-shadow-sm flex items-center justify-center gap-1 w-full"
            >
              Buka
              <IconArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Modul 2: Keuangan */}
          <div className="bg-white border-2 border-black rounded-xl p-2.5 comic-shadow flex flex-col justify-between space-y-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 bg-[#A3E635] border border-black rounded-lg comic-shadow-sm flex items-center justify-center text-black">
                  <IconWallet className="w-3.5 h-3.5" />
                </div>
                <span className="text-[8px] font-black uppercase bg-[#FFFDF6] border border-black px-1 rounded text-slate-700">M2</span>
              </div>

              <div>
                <h3 className="font-display font-black text-xs text-black uppercase leading-tight">Keuangan</h3>
                <p className="text-[9px] font-bold text-slate-600 line-clamp-2">
                  Arus kas & OCR Scan Nota.
                </p>
              </div>

              <div className="bg-[#FFFDF6] border border-black p-1 rounded-lg text-[9px] font-bold space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Saldo:</span>
                  <span className="font-mono text-black truncate">Rp {totalBalance.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Log:</span>
                  <span className="font-mono text-black">{financeRecords.length}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('finance')}
              className="comic-button bg-[#A3E635] text-black font-black text-[10px] uppercase py-1 rounded-lg border border-black comic-shadow-sm flex items-center justify-center gap-1 w-full"
            >
              Buka
              <IconArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Modul 3: Kegiatan */}
          <div className="bg-white border-2 border-black rounded-xl p-2.5 comic-shadow flex flex-col justify-between space-y-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 bg-[#00E5FF] border border-black rounded-lg comic-shadow-sm flex items-center justify-center text-black">
                  <IconCalendar className="w-3.5 h-3.5" />
                </div>
                <span className="text-[8px] font-black uppercase bg-[#FFFDF6] border border-black px-1 rounded text-slate-700">M3</span>
              </div>

              <div>
                <h3 className="font-display font-black text-xs text-black uppercase leading-tight">Kegiatan</h3>
                <p className="text-[9px] font-bold text-slate-600 line-clamp-2">
                  Trip tracker & rutinitas.
                </p>
              </div>

              <div className="bg-[#FFFDF6] border border-black p-1 rounded-lg text-[9px] font-bold space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Rutin:</span>
                  <span className="font-mono text-black">{completedRoutines}/{routines.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Trip:</span>
                  <span className="font-mono text-cyan-700">Live Timer</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('activities')}
              className="comic-button bg-[#00E5FF] text-black font-black text-[10px] uppercase py-1 rounded-lg border border-black comic-shadow-sm flex items-center justify-center gap-1 w-full"
            >
              Buka
              <IconArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Modul 4: Catatan */}
          <div className="bg-white border-2 border-black rounded-xl p-2.5 comic-shadow flex flex-col justify-between space-y-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 bg-[#A855F7] border border-black rounded-lg comic-shadow-sm flex items-center justify-center text-white">
                  <IconNote className="w-3.5 h-3.5" />
                </div>
                <span className="text-[8px] font-black uppercase bg-[#FFFDF6] border border-black px-1 rounded text-slate-700">M4</span>
              </div>

              <div>
                <h3 className="font-display font-black text-xs text-black uppercase leading-tight">Catatan</h3>
                <p className="text-[9px] font-bold text-slate-600 line-clamp-2">
                  Brankas PIN & IG Notes.
                </p>
              </div>

              <div className="bg-[#FFFDF6] border border-black p-1 rounded-lg text-[9px] font-bold space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Note:</span>
                  <span className="font-mono text-black">{notes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Vault:</span>
                  <span className="font-mono text-purple-700">PIN OK</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('notes')}
              className="comic-button bg-[#A855F7] text-white font-black text-[10px] uppercase py-1 rounded-lg border border-black comic-shadow-sm flex items-center justify-center gap-1 w-full"
            >
              Buka
              <IconArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Modul 5: Waktu Ibadah */}
          <div className="col-span-2 sm:col-span-1 bg-white border-2 border-black rounded-xl p-2.5 comic-shadow flex flex-col justify-between space-y-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 bg-[#10B981] border border-black rounded-lg comic-shadow-sm flex items-center justify-center text-white">
                  <span className="text-sm">🕌</span>
                </div>
                <span className="text-[8px] font-black uppercase bg-[#FFFDF6] border border-black px-1 rounded text-slate-700">M5</span>
              </div>

              <div>
                <h3 className="font-display font-black text-xs text-black uppercase leading-tight">Waktu Ibadah</h3>
                <p className="text-[9px] font-bold text-slate-600 line-clamp-2">
                  Portal Shalat Web Preview.
                </p>
              </div>

              <div className="bg-[#FFFDF6] border border-black p-1 rounded-lg text-[9px] font-bold space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Portal:</span>
                  <span className="font-mono text-emerald-700">waktuibadah</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Mode:</span>
                  <span className="font-mono text-black">Fullscreen</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('worship')}
              className="comic-button bg-[#10B981] text-white font-black text-[10px] uppercase py-1 rounded-lg border border-black comic-shadow-sm flex items-center justify-center gap-1 w-full"
            >
              Buka
              <IconArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
