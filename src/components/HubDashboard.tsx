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
  const pendingPrayers = prayers.filter(p => !p.completed).length;

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      
      {/* Pop Comic Hero Banner */}
      <div className="bg-[#FFD000] border-2 sm:border-3 border-black rounded-2xl sm:rounded-3xl p-4 sm:p-7 comic-shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-halftone pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center">
          <div className="lg:col-span-8 space-y-2.5 sm:space-y-3">
            
            <div className="inline-flex items-center gap-1.5 bg-black text-white px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider comic-shadow-sm">
              <IconSparkles className="w-3 h-3 text-[#FFD000]" />
              ManageMe! Dashboard
            </div>

            <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl text-black leading-tight uppercase tracking-wide">
              PUSAT INTEGRASI <br />
              <span className="bg-[#FF4B82] text-white px-2.5 sm:px-3 py-0.5 rounded-xl border-2 border-black inline-block transform -rotate-1 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
                SEMUA APLIKASI
              </span> KOS & HARIAN!
            </h1>

            <p className="text-slate-900 font-bold text-xs sm:text-sm leading-relaxed max-w-2xl">
              Hub lengkap untuk inventaris kosan (KosMan), manajemen keuangan & cashflow, pencatatan kegiatan harian, serta catatan pribadi dengan penyimpanan lokal & ekspor Google Sheets.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => onNavigate('kosman')}
                className="comic-button bg-[#FF4B82] text-white font-black text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border-2 border-black comic-shadow flex items-center gap-1.5 uppercase"
              >
                <IconHome className="w-4 h-4 text-white" />
                Buka KosMan
                <IconArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('finance')}
                className="comic-button bg-[#A3E635] text-black font-black text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border-2 border-black comic-shadow flex items-center gap-1.5 uppercase"
              >
                <IconWallet className="w-4 h-4 text-black" />
                Keuangan
              </button>

              <button
                onClick={onOpenChatGPT}
                className="comic-button bg-[#00E5FF] text-black font-black text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border-2 border-black comic-shadow flex items-center gap-1.5 uppercase"
              >
                <IconBot className="w-4 h-4 text-black" />
                ChatGPT Sync
              </button>
            </div>
          </div>

          {/* Quick Stat Highlights */}
          <div className="lg:col-span-4 bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-3.5 sm:p-5 comic-shadow space-y-3">
            <h3 className="font-display font-black text-xs sm:text-sm uppercase border-b-2 border-black pb-1.5 text-black flex items-center justify-between">
              <span>STATUS KESELURUHAN</span>
              <span className="bg-[#A3E635] text-black text-[10px] px-1.5 py-0.2 rounded border border-black font-black">LOCAL DB</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-[#FFFDF6] border-2 border-black p-2 rounded-xl">
                <span className="block text-lg sm:text-xl font-black font-mono text-black">{totalItems}</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 uppercase">Katalog KosMan</span>
              </div>
              <div className="bg-[#FF4B82] text-white border-2 border-black p-2 rounded-xl">
                <span className="block text-lg sm:text-xl font-black font-mono">{needBuyCount}</span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase">Perlu Dibeli</span>
              </div>
            </div>

            <div className="bg-[#00E5FF] border-2 border-black p-2.5 rounded-xl text-center">
              <span className="text-[10px] font-bold text-black uppercase block">Saldo Kas & Bank</span>
              <span className="text-base sm:text-lg font-black font-mono text-black">
                Rp {totalBalance.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Apps Active Cards Grid */}
      <div className="space-y-3">
        <div>
          <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-wide text-black">
            MODUL APLIKASI MANAGEME!
          </h2>
          <p className="text-[11px] font-bold text-slate-600">Pilih modul yang ingin diakses:</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          
          {/* Modul 1: KosMan */}
          <div className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-4 comic-shadow flex flex-col justify-between space-y-3 group hover:-translate-y-1 transition-transform">
            <div className="space-y-2.5">
              <div className="w-10 h-10 bg-[#FF4B82] border-2 border-black rounded-xl comic-shadow-sm flex items-center justify-center text-white">
                <IconHome className="w-5 h-5" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase bg-[#FFFDF6] border border-black px-1.5 py-0.2 rounded text-slate-700">Modul 1</span>
                <h3 className="font-display font-black text-base text-black uppercase mt-1">KosMan</h3>
                <p className="text-[11px] font-bold text-slate-600 mt-0.5">
                  Katalog barang kosan, cek stok habis/aman, dan belanja.
                </p>
              </div>

              <div className="bg-[#FFFDF6] border-2 border-black p-2 rounded-xl text-[11px] font-bold space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Katalog:</span>
                  <span className="font-mono text-black">{totalItems} Item</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Perlu Dibeli:</span>
                  <span className="font-mono text-red-600">{needBuyCount} Item</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('kosman')}
              className="comic-button bg-[#FF4B82] text-white font-black text-xs uppercase py-2 rounded-xl border-2 border-black comic-shadow-sm flex items-center justify-center gap-1.5"
            >
              Buka KosMan
              <IconArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Modul 2: Keuangan */}
          <div className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-4 comic-shadow flex flex-col justify-between space-y-3 group hover:-translate-y-1 transition-transform">
            <div className="space-y-2.5">
              <div className="w-10 h-10 bg-[#A3E635] border-2 border-black rounded-xl comic-shadow-sm flex items-center justify-center text-black">
                <IconWallet className="w-5 h-5" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase bg-[#FFFDF6] border border-black px-1.5 py-0.2 rounded text-slate-700">Modul 2</span>
                <h3 className="font-display font-black text-base text-black uppercase mt-1">Keuangan OS</h3>
                <p className="text-[11px] font-bold text-slate-600 mt-0.5">
                  Arus kas, tabungan, dan auto-sync belanja kos ke KosMan.
                </p>
              </div>

              <div className="bg-[#FFFDF6] border-2 border-black p-2 rounded-xl text-[11px] font-bold space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Saldo:</span>
                  <span className="font-mono text-black">Rp {totalBalance.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Transaksi:</span>
                  <span className="font-mono text-black">{financeRecords.length} Data</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('finance')}
              className="comic-button bg-[#A3E635] text-black font-black text-xs uppercase py-2 rounded-xl border-2 border-black comic-shadow-sm flex items-center justify-center gap-1.5"
            >
              Buka Keuangan
              <IconArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Modul 3: Kegiatan & Perjalanan */}
          <div className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-4 comic-shadow flex flex-col justify-between space-y-3 group hover:-translate-y-1 transition-transform">
            <div className="space-y-2.5">
              <div className="w-10 h-10 bg-[#00E5FF] border-2 border-black rounded-xl comic-shadow-sm flex items-center justify-center text-black">
                <IconCalendar className="w-5 h-5" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase bg-[#FFFDF6] border border-black px-1.5 py-0.2 rounded text-slate-700">Modul 3</span>
                <h3 className="font-display font-black text-base text-black uppercase mt-1">Kegiatan & Trip</h3>
                <p className="text-[11px] font-bold text-slate-600 mt-0.5">
                  Rutinitas harian, target, workout, dan live trip tracker.
                </p>
              </div>

              <div className="bg-[#FFFDF6] border-2 border-black p-2 rounded-xl text-[11px] font-bold space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Rutinitas:</span>
                  <span className="font-mono text-black">{completedRoutines}/{routines.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Perjalanan:</span>
                  <span className="font-mono text-cyan-700">Live Timer</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('activities')}
              className="comic-button bg-[#00E5FF] text-black font-black text-xs uppercase py-2 rounded-xl border-2 border-black comic-shadow-sm flex items-center justify-center gap-1.5"
            >
              Buka Kegiatan
              <IconArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Modul 4: Catatan Terpadu */}
          <div className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-4 comic-shadow flex flex-col justify-between space-y-3 group hover:-translate-y-1 transition-transform">
            <div className="space-y-2.5">
              <div className="w-10 h-10 bg-[#A855F7] border-2 border-black rounded-xl comic-shadow-sm flex items-center justify-center text-white">
                <IconNote className="w-5 h-5" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase bg-[#FFFDF6] border border-black px-1.5 py-0.2 rounded text-slate-700">Modul 4</span>
                <h3 className="font-display font-black text-base text-black uppercase mt-1">Catatan (Notes)</h3>
                <p className="text-[11px] font-bold text-slate-600 mt-0.5">
                  Catatan umum, kutipan musik IG Notes, dan brankas PIN.
                </p>
              </div>

              <div className="bg-[#FFFDF6] border-2 border-black p-2 rounded-xl text-[11px] font-bold space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Catatan:</span>
                  <span className="font-mono text-black">{notes.length} Item</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Keamanan:</span>
                  <span className="font-mono text-purple-700">PIN Brankas</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('notes')}
              className="comic-button bg-[#A855F7] text-white font-black text-xs uppercase py-2 rounded-xl border-2 border-black comic-shadow-sm flex items-center justify-center gap-1.5"
            >
              Buka Catatan
              <IconArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Modul 5: Waktu Ibadah */}
          <div className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-4 comic-shadow flex flex-col justify-between space-y-3 group hover:-translate-y-1 transition-transform">
            <div className="space-y-2.5">
              <div className="w-10 h-10 bg-[#10B981] border-2 border-black rounded-xl comic-shadow-sm flex items-center justify-center text-white">
                <span className="text-lg">🕌</span>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase bg-[#FFFDF6] border border-black px-1.5 py-0.2 rounded text-slate-700">Modul 5</span>
                <h3 className="font-display font-black text-base text-black uppercase mt-1">Waktu Ibadah</h3>
                <p className="text-[11px] font-bold text-slate-600 mt-0.5">
                  Jadwal shalat 5 waktu, arah kiblat, & waktuibadah.vercel.app.
                </p>
              </div>

              <div className="bg-[#FFFDF6] border-2 border-black p-2 rounded-xl text-[11px] font-bold space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Kiblat:</span>
                  <span className="font-mono text-black">295° NW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Portal Web:</span>
                  <span className="font-mono text-[#10B981]">Terhubung</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('worship')}
              className="comic-button bg-[#10B981] text-white font-black text-xs uppercase py-2 rounded-xl border-2 border-black comic-shadow-sm flex items-center justify-center gap-1.5"
            >
              Buka Ibadah
              <IconArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
