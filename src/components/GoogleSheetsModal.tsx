import React, { useState, useEffect } from 'react';
import { IconSheet, IconDownload, IconCopy, IconCheck, IconSparkles } from './icons/SvgIcons';
import { InlineConfirmBar, InlineNotice } from './InlineUI';
import {
  googleSignIn,
  googleSignInRedirect,
  googleSignOut,
  getAccessToken,
  getConnectedEmail,
  getSpreadsheetId,
  setSpreadsheetId,
  setupSpreadsheetDatabase,
  pullDatabaseFromSheets,
  initGoogleAuth,
  FullSpreadsheetPayload,
} from '../services/googleSheetsAutoSync';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullPayload: FullSpreadsheetPayload;
  onSyncPullSuccess: (pulled: Partial<FullSpreadsheetPayload>) => void;
}

/**
 * Panel "Set Spreadsheet Saya" menyatu langsung di dalam website (inline in-flow, bukan pop-up).
 * Menggunakan Google Workspace OAuth + LocalStorage (tanpa Firestore).
 */
export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  fullPayload,
  onSyncPullSuccess,
}) => {
  const [copiedTSV, setCopiedTSV] = useState(false);
  const [copiedFinanceTSV, setCopiedFinanceTSV] = useState(false);
  const [sheetIdInput, setSheetIdInput] = useState(getSpreadsheetId());
  const [isConnected, setIsConnected] = useState(!!getAccessToken());
  const [userEmail, setUserEmail] = useState<string | null>(getConnectedEmail());
  const [isBusy, setIsBusy] = useState(false);
  const [showRedirectHint, setShowRedirectHint] = useState(false);
  const [pendingConfirmAction, setPendingConfirmAction] = useState<'setup' | 'pull' | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  useEffect(() => {
    const unsub = initGoogleAuth(
      (email, token) => {
        setIsConnected(!!token);
        setUserEmail(email);
        setShowRedirectHint(false);
      },
      () => {
        setIsConnected(!!getAccessToken());
        if (!getAccessToken()) setUserEmail(null);
      }
    );
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const activeSpreadsheetId = getSpreadsheetId();
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${activeSpreadsheetId}/edit`;
  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleGoogleLogin = async () => {
    setIsBusy(true);
    setStatusMessage(null);
    setShowRedirectHint(false);
    try {
      const res = await googleSignIn();
      if (res) {
        setIsConnected(true);
        setUserEmail(res.email);
        setStatusMessage({
          type: 'success',
          text: `Berhasil login sebagai ${res.email}. Sekarang Anda bisa menekan "Setup 9 Tab Database + Rumus" atau "Tarik Data Terbaru".`,
        });
      }
    } catch (err: any) {
      const msg = err?.message || 'Gagal login Google Workspace.';
      setStatusMessage({ type: 'error', text: msg });
      if (msg.toLowerCase().includes('pop-up') || msg.toLowerCase().includes('popup')) {
        setShowRedirectHint(true);
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleSaveSheetId = () => {
    const clean = setSpreadsheetId(sheetIdInput);
    setSheetIdInput(clean);
    setStatusMessage({
      type: 'info',
      text: isConnected
        ? `Spreadsheet aktif diset ke ID: ${clean}. Silakan tekan "Setup 9 Tab Database + Rumus" di Langkah 3.`
        : `Spreadsheet ID tersimpan (${clean}). Selanjutnya klik "Sign in with Google" pada Langkah 1 agar tombol Setup & Sync aktif.`,
    });
  };

  const handleRequestAction = (action: 'setup' | 'pull') => {
    const token = getAccessToken();
    if (!token || !isConnected) {
      setStatusMessage({
        type: 'error',
        text: 'Anda belum login Google. Klik tombol "Sign in with Google" pada Langkah 1 terlebih dahulu untuk memberi izin akses ke Spreadsheet.',
      });
      return;
    }
    setPendingConfirmAction(action);
  };

  const handleConfirmedSetupSchema = async () => {
    const token = getAccessToken();
    if (!token) {
      setStatusMessage({ type: 'error', text: 'Sesi login habis. Klik "Sign in with Google" lagi.' });
      setPendingConfirmAction(null);
      setIsConnected(false);
      return;
    }

    setIsBusy(true);
    setPendingConfirmAction(null);
    try {
      await setupSpreadsheetDatabase(token, activeSpreadsheetId, fullPayload);
      setStatusMessage({
        type: 'success',
        text: 'Berhasil! 9 Tab Terpusat (Dashboard, KosMan Inventaris, KosMan Riwayat Beli, Wishlist, Keuangan, Budget Rasio, Kegiatan, Catatan, Waktu Ibadah) + rumus otomatis sudah dibuat.',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Gagal setup Spreadsheet. Pastikan akun Google Anda memiliki akses Editor di Spreadsheet ini.',
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleConfirmedPullData = async () => {
    const token = getAccessToken();
    if (!token) {
      setStatusMessage({ type: 'error', text: 'Sesi login habis. Klik "Sign in with Google" lagi.' });
      setPendingConfirmAction(null);
      setIsConnected(false);
      return;
    }

    setIsBusy(true);
    setPendingConfirmAction(null);
    try {
      const pulled = await pullDatabaseFromSheets(token, activeSpreadsheetId);
      onSyncPullSuccess(pulled);
      setStatusMessage({
        type: 'success',
        text: `Sinkronisasi 2-Arah selesai! Terbaca ${pulled.counts.items} item KosMan, ${pulled.counts.wishlist} wishlist, ${pulled.counts.finance} transaksi, ${pulled.counts.activities} kegiatan, dan ${pulled.counts.notes} catatan.`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Gagal menarik data dari Spreadsheet.' });
    } finally {
      setIsBusy(false);
    }
  };

  const handleCopyKosManTSV = () => {
    const headers = ['ID', 'Nama_Item', 'Kategori', 'Multi_Tags', 'Sub_Kategori', 'Stok', 'Satuan', 'Min_Stok', 'Total_Belanja_Rp'];
    const rows = fullPayload.items.map((item) => [
      item.id,
      item.name,
      item.category,
      (item.tags || [item.category]).join(', '),
      item.subCategory,
      item.quantity,
      item.unit,
      item.minThreshold,
      item.totalSpend || 0,
    ]);
    navigator.clipboard.writeText([headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n'));
    setCopiedTSV(true);
    setStatusMessage({ type: 'success', text: 'Tabel inventaris tersalin ke clipboard!' });
    setTimeout(() => setCopiedTSV(false), 3000);
  };

  const handleCopyFinanceTSV = () => {
    const headers = ['ID', 'Tanggal', 'Jam', 'Tipe', 'Kategori', 'Keterangan', 'Nominal_Rp', 'Akun'];
    const rows = fullPayload.financeRecords.map((f) => [
      f.id,
      f.date,
      f.time || '',
      f.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      f.category,
      f.note,
      f.amount,
      f.account,
    ]);
    navigator.clipboard.writeText([headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n'));
    setCopiedFinanceTSV(true);
    setStatusMessage({ type: 'success', text: 'Tabel keuangan tersalin ke clipboard!' });
    setTimeout(() => setCopiedFinanceTSV(false), 3000);
  };

  const handleDownloadCSV = () => {
    const headers = ['id,name,category,tags,subCategory,quantity,unit,minThreshold,totalSpend'];
    const rows = fullPayload.items.map(
      (i) =>
        `"${i.id}","${i.name.replace(/"/g, '""')}","${i.category}","${(i.tags || [i.category]).join(', ')}","${i.subCategory}",${i.quantity},"${i.unit}",${i.minThreshold},${i.totalSpend || 0}`
    );
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ManageMe_KosMan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setStatusMessage({ type: 'success', text: 'File CSV inventaris diunduh!' });
  };

  return (
    <section className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-3">
      <div className="bg-white border-2 border-black rounded-xl p-3.5 sm:p-5 shadow-[4px_4px_0px_#000] space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#A3E635] border border-black rounded-lg flex items-center justify-center font-black shadow-[1.5px_1.5px_0px_#000]">
              <IconSheet className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm sm:text-base uppercase text-black leading-none">
                SET SPREADSHEET SAYA (LOCAL STORAGE + GOOGLE SHEETS)
              </h3>
              <span className="text-[10px] font-bold text-slate-600">
                Tanpa Firestore · Data lokal + sinkron otomatis 9 tab Spreadsheet setelah login Google
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 bg-slate-100 border border-black rounded-lg text-xs font-black text-black"
          >
            Tutup
          </button>
        </div>

        {/* Inline Status Notice */}
        {statusMessage && (
          <InlineNotice
            type={statusMessage.type}
            message={statusMessage.text}
            onClose={() => setStatusMessage(null)}
          />
        )}

        {/* Popup-Blocked / Iframe Fallback Help */}
        {showRedirectHint && (
          <div className="bg-[#FFD000]/30 border-2 border-black rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
            <span>
              Jika pop-up login diblokir oleh pratinjau/iframe, buka aplikasi di tab baru atau coba mode redirect:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {typeof window !== 'undefined' && (
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-black text-white rounded-lg text-[11px] font-black flex items-center gap-1"
                >
                  <span>Buka App di Tab Baru</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                type="button"
                onClick={() => googleSignInRedirect()}
                className="px-2.5 py-1 bg-white border border-black rounded-lg text-[11px] font-black text-black"
              >
                Login Mode Redirect
              </button>
            </div>
          </div>
        )}

        {/* Inline Confirmation Banner before Mutating Spreadsheet or Overwriting Local Data */}
        {pendingConfirmAction && (
          <InlineConfirmBar
            danger={pendingConfirmAction === 'setup'}
            title={
              pendingConfirmAction === 'setup'
                ? 'Konfirmasi Inisialisasi & Tulis Ulang 9 Tab Spreadsheet?'
                : 'Konfirmasi Tarik Data Terbaru (Sync Pull) dari Spreadsheet?'
            }
            description={
              pendingConfirmAction === 'setup'
                ? `Aksi ini membuat/memperbarui 9 tab (KosMan_Inventaris, KosMan_Riwayat_Beli, Wishlist_Belanja, Keuangan_Transaksi, Keuangan_Budget_Pos, Kegiatan_Harian, Catatan_Pribadi, Waktu_Ibadah, Dashboard_Ringkasan) pada Spreadsheet ID: ${activeSpreadsheetId}.`
                : `Data lokal aplikasi akan diperbarui sesuai isi terbaru Google Spreadsheet ID: ${activeSpreadsheetId} (termasuk perubahan dari ChatGPT).`
            }
            confirmLabel="Ya, Sinkronkan"
            onConfirm={
              pendingConfirmAction === 'setup'
                ? handleConfirmedSetupSchema
                : handleConfirmedPullData
            }
            onCancel={() => setPendingConfirmAction(null)}
          />
        )}

        {/* LANGKAH 1: LOGIN GOOGLE */}
        <div
          className={`border-2 border-black p-3 rounded-xl space-y-2 ${
            isConnected ? 'bg-[#A3E635]/20' : 'bg-[#FFD000]/25'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase text-black block">
                Langkah 1: Login Akun Google (Izin Baca/Tulis Spreadsheet)
              </span>
              <p className="text-[11px] font-bold text-slate-700">
                {isConnected
                  ? `Terhubung sebagai ${userEmail || 'Google Account'}. Sinkronisasi otomatis aktif.`
                  : 'Wajib login Google sekali setiap membuka tab agar aplikasi diizinkan mengedit Spreadsheet Anda.'}
              </p>
            </div>

            {isConnected ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-[#A3E635] border border-black px-2 py-1 rounded text-black">
                  TERHUBUNG: {userEmail || 'Google Account'}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await googleSignOut();
                    setIsConnected(false);
                    setUserEmail(null);
                  }}
                  className="text-[11px] font-black underline text-slate-700 hover:text-black"
                >
                  Putus / Ganti Akun
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isBusy}
                  className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border-2 border-black px-3.5 py-1.5 rounded-lg text-xs font-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isBusy ? 'Membuka Login...' : 'Sign in with Google'}</span>
                </button>
                {isInsideIframe && typeof window !== 'undefined' && (
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-slate-900 text-white border border-black rounded-lg text-[10px] font-black flex items-center gap-1"
                    title="Jika pop-up diblokir iframe AI Studio, buka di tab penuh"
                  >
                    <span>Tab Baru</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* LANGKAH 2 & 3: SET SPREADSHEET + SETUP 9 TAB + SYNC */}
        <div className="bg-[#FFFDF6] border-2 border-black p-3 rounded-xl space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-600 block">
                Langkah 2: Spreadsheet Database Aktif
              </span>
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono font-black text-blue-700 hover:underline flex items-center gap-1"
              >
                <span className="truncate max-w-[230px] sm:max-w-md">{activeSpreadsheetId}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-1.5">
            <input
              type="text"
              value={sheetIdInput}
              onChange={(e) => setSheetIdInput(e.target.value)}
              placeholder="Tempel URL atau ID Google Spreadsheet pribadi Anda..."
              className="flex-1 px-2.5 py-1.5 border border-black rounded-lg text-xs font-mono bg-white"
            />
            <button
              type="button"
              onClick={handleSaveSheetId}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-black uppercase border border-black"
            >
              Set Spreadsheet
            </button>
          </div>

          <div className="pt-1 space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-600 block">
              Langkah 3: Setup Database & Sinkronisasi
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRequestAction('setup')}
                disabled={isBusy}
                className={`comic-button p-2 rounded-lg border border-black font-black text-xs uppercase flex items-center justify-center gap-1.5 ${
                  isConnected
                    ? 'bg-[#FFD000] text-black'
                    : 'bg-[#FFD000]/60 text-slate-800'
                }`}
              >
                <IconSparkles className="w-3.5 h-3.5" />
                <span>{isBusy ? 'Memproses...' : 'Setup 9 Tab Database + Rumus'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleRequestAction('pull')}
                disabled={isBusy}
                className={`comic-button p-2 rounded-lg border border-black font-black text-xs uppercase flex items-center justify-center gap-1.5 ${
                  isConnected
                    ? 'bg-[#00E5FF] text-black'
                    : 'bg-[#00E5FF]/60 text-slate-800'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                <span>Tarik Data Terbaru (Sync Pull)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Offline Fallback Copy / Export */}
        <div className="bg-slate-50 border border-black p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-black uppercase text-slate-700">Ekspor Cepat Offline:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={handleCopyKosManTSV}
              className="bg-white text-black px-2.5 py-1 rounded-lg border border-black font-bold text-[11px] flex items-center gap-1"
            >
              {copiedTSV ? <IconCheck className="w-3 h-3 text-green-700" /> : <IconCopy className="w-3 h-3" />}
              <span>{copiedTSV ? 'Tersalin' : 'Salin Stok'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyFinanceTSV}
              className="bg-white text-black px-2.5 py-1 rounded-lg border border-black font-bold text-[11px] flex items-center gap-1"
            >
              {copiedFinanceTSV ? <IconCheck className="w-3 h-3 text-green-700" /> : <IconCopy className="w-3 h-3" />}
              <span>{copiedFinanceTSV ? 'Tersalin' : 'Salin Kas'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="bg-white text-black px-2.5 py-1 rounded-lg border border-black font-bold text-[11px] flex items-center gap-1"
            >
              <IconDownload className="w-3 h-3" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
