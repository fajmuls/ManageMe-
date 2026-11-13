import React, { useState, useEffect } from 'react';
import { KosItem, FinanceRecord, WishlistItem, BudgetPos } from '../types/kosman';
import { 
  IconSheet, IconDownload, IconCopy, IconCheck, 
  IconUpload, IconCheckCircle, IconAlert, IconSparkles 
} from './icons/SvgIcons';
import {
  googleSignIn, googleSignOut, getAccessToken, getCurrentUser,
  getSpreadsheetId, setSpreadsheetId, setupSpreadsheetDatabase,
  pullDatabaseFromSheets, initGoogleAuth
} from '../services/googleSheetsAutoSync';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: KosItem[];
  wishlist: WishlistItem[];
  financeRecords: FinanceRecord[];
  budgetPos: BudgetPos[];
  onUpdateAllItems: (newItems: KosItem[]) => void;
  onSyncPullSuccess: (pulled: {
    items: KosItem[];
    wishlist: WishlistItem[];
    financeRecords: FinanceRecord[];
    budgetPos: BudgetPos[];
  }) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  items,
  wishlist,
  financeRecords,
  budgetPos,
  onUpdateAllItems,
  onSyncPullSuccess,
}) => {
  const [copiedTSV, setCopiedTSV] = useState(false);
  const [copiedFinanceTSV, setCopiedFinanceTSV] = useState(false);
  const [pasteInputText, setPasteInputText] = useState('');
  const [sheetIdInput, setSheetIdInput] = useState(getSpreadsheetId());
  const [isConnected, setIsConnected] = useState(!!getAccessToken());
  const [userEmail, setUserEmail] = useState<string | null>(getCurrentUser()?.email || null);
  const [isBusy, setIsBusy] = useState(false);
  const [pendingConfirmAction, setPendingConfirmAction] = useState<'setup' | 'pull' | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    const unsub = initGoogleAuth(
      (user, token) => {
        setIsConnected(!!token);
        setUserEmail(user.email);
      },
      () => {
        setIsConnected(!!getAccessToken());
      }
    );
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const activeSpreadsheetId = getSpreadsheetId();
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${activeSpreadsheetId}/edit`;

  const handleGoogleLogin = async () => {
    setIsBusy(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setIsConnected(true);
        setUserEmail(res.user.email);
        setStatusMessage({ type: 'success', text: `Terhubung sebagai ${res.user.email}! Siap membaca & menulis ke Google Spreadsheet.` });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Gagal login Google Workspace.' });
    } finally {
      setIsBusy(false);
    }
  };

  const handleSaveSheetId = () => {
    const clean = setSpreadsheetId(sheetIdInput);
    setSheetIdInput(clean);
    setStatusMessage({ type: 'info', text: `Target Spreadsheet ID diperbarui: ${clean}` });
  };

  const handleConfirmedSetupSchema = async () => {
    const token = getAccessToken();
    if (!token) {
      setStatusMessage({ type: 'error', text: 'Silakan Sign in with Google terlebih dahulu.' });
      setPendingConfirmAction(null);
      return;
    }

    setIsBusy(true);
    setPendingConfirmAction(null);
    try {
      await setupSpreadsheetDatabase(token, activeSpreadsheetId, {
        items,
        wishlist,
        financeRecords,
        budgetPos,
      });
      setStatusMessage({
        type: 'success',
        text: 'Berhasil! 5 Tab Database (Dashboard_Ringkasan, KosMan_Inventaris, Wishlist_Belanja, Keuangan_Transaksi, Kos_Budget_Simulasi) beserta rumus otomatis & filter tabel telah dibuat di Spreadsheet Anda.',
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Gagal setup Spreadsheet.' });
    } finally {
      setIsBusy(false);
    }
  };

  const handleConfirmedPullData = async () => {
    const token = getAccessToken();
    if (!token) {
      setStatusMessage({ type: 'error', text: 'Silakan Sign in with Google terlebih dahulu.' });
      setPendingConfirmAction(null);
      return;
    }

    setIsBusy(true);
    setPendingConfirmAction(null);
    try {
      const pulled = await pullDatabaseFromSheets(token, activeSpreadsheetId);
      onSyncPullSuccess(pulled);
      setStatusMessage({
        type: 'success',
        text: `Sinkronisasi 2-Arah Berhasil! Terbaca ${pulled.items.length} item KosMan, ${pulled.wishlist.length} wishlist, ${pulled.financeRecords.length} transaksi, dan ${pulled.budgetPos.length} pos anggaran.`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Gagal menarik data dari Spreadsheet.' });
    } finally {
      setIsBusy(false);
    }
  };

  // Offline TSV Copy Helpers
  const handleCopyKosManTSV = () => {
    const headers = ['ID', 'Nama_Item', 'Kategori_Utama', 'Multi_Tags', 'Sub_Kategori', 'Stok', 'Satuan', 'Min_Stok', 'Harga_Satuan'];
    const rows = items.map(item => [
      item.id,
      item.name,
      item.category,
      (item.tags || [item.category]).join(', '),
      item.subCategory,
      item.quantity,
      item.unit,
      item.minThreshold,
      item.price
    ]);
    navigator.clipboard.writeText([headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n'));
    setCopiedTSV(true);
    setStatusMessage({ type: 'success', text: 'Tabel inventaris tersalin ke clipboard!' });
    setTimeout(() => setCopiedTSV(false), 3000);
  };

  const handleCopyFinanceTSV = () => {
    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Nominal', 'Akun'];
    const rows = financeRecords.map(f => [
      f.id,
      f.date,
      f.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      f.category,
      f.note,
      f.amount,
      f.account
    ]);
    navigator.clipboard.writeText([headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n'));
    setCopiedFinanceTSV(true);
    setStatusMessage({ type: 'success', text: 'Tabel keuangan tersalin ke clipboard!' });
    setTimeout(() => setCopiedFinanceTSV(false), 3000);
  };

  const handleDownloadCSV = () => {
    const headers = ['id,name,category,tags,subCategory,quantity,unit,price,minThreshold'];
    const rows = items.map(i =>
      `"${i.id}","${i.name.replace(/"/g, '""')}","${i.category}","${(i.tags || [i.category]).join(', ')}","${i.subCategory}",${i.quantity},"${i.unit}",${i.price},${i.minThreshold}`
    );
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ManageMe_KosMan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setStatusMessage({ type: 'success', text: 'File CSV diunduh!' });
  };

  const handleImportPastedTSV = () => {
    if (!pasteInputText.trim()) return;
    try {
      const lines = pasteInputText.trim().split('\n');
      const newItems: KosItem[] = [];
      lines.forEach((line, idx) => {
        const cols = line.split('\t');
        if (cols.length >= 2) {
          if (idx === 0 && (cols[0].toLowerCase().includes('id') || cols[1].toLowerCase().includes('nama'))) return;
          newItems.push({
            id: 'sheets-' + Date.now() + '-' + idx,
            name: (cols[1] || cols[0]).trim(),
            category: (cols[2] as any) || 'Bumbu Dapur',
            tags: String(cols[3] || cols[2] || 'Bumbu Dapur').split(',').map(s => s.trim() as any),
            subCategory: cols[4] || 'Umum',
            quantity: parseInt(cols[5]) || 0,
            unit: cols[6] || 'buah',
            minThreshold: parseInt(cols[7]) || 1,
            price: parseInt(cols[8]) || 10000,
            timesPurchased: 0,
            totalSpend: 0,
          });
        }
      });
      if (newItems.length > 0) {
        onUpdateAllItems(newItems);
        setStatusMessage({ type: 'success', text: `Berhasil impor ${newItems.length} barang dari paste!` });
        setPasteInputText('');
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Gagal mengurai data paste.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
      <div className="bg-white border-2 border-black rounded-2xl p-3.5 sm:p-5 shadow-[5px_5px_0px_#000] max-w-xl w-full space-y-3 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#A3E635] border border-black rounded-lg flex items-center justify-center font-black shadow-[1.5px_1.5px_0px_#000]">
              <IconSheet className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm sm:text-base uppercase text-black leading-none">
                DATABASE GOOGLE SHEETS 2-ARAH
              </h3>
              <span className="text-[10px] font-bold text-slate-500">Auto-Rumus, Filter & Sinkron ChatGPT</span>
            </div>
          </div>
          <button onClick={onClose} className="font-bold text-slate-500 hover:text-black text-base px-2">✕</button>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className={`p-2 border border-black rounded-lg text-[11px] font-bold flex items-start gap-2 ${
            statusMessage.type === 'success' ? 'bg-[#A3E635] text-black' :
            statusMessage.type === 'error' ? 'bg-[#FF4B82] text-white' : 'bg-[#00E5FF] text-black'
          }`}>
            {statusMessage.type === 'success' ? <IconCheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <IconAlert className="w-4 h-4 shrink-0 mt-0.5" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Confirmation Dialog Banner before Mutating Spreadsheet */}
        {pendingConfirmAction && (
          <div className="bg-[#FFD000] border-2 border-black rounded-xl p-3 space-y-2 shadow-[3px_3px_0px_#000]">
            <h4 className="font-black text-xs uppercase text-black flex items-center gap-1.5">
              <IconAlert className="w-4 h-4" />
              {pendingConfirmAction === 'setup'
                ? 'Konfirmasi Inisialisasi & Tulis Ulang Schema Spreadsheet?'
                : 'Konfirmasi Tarik Data (Sync Pull) dari Spreadsheet?'}
            </h4>
            <p className="text-[11px] font-bold text-slate-900">
              {pendingConfirmAction === 'setup'
                ? `Tindakan ini akan membuat/memperbarui 5 tab (Dashboard_Ringkasan, KosMan_Inventaris, Wishlist_Belanja, Keuangan_Transaksi, Kos_Budget_Simulasi) lengkap dengan rumus & filter pada Spreadsheet ID: ${activeSpreadsheetId}.`
                : `Data lokal aplikasi akan diperbarui sesuai isi terbaru dari Google Spreadsheet ID: ${activeSpreadsheetId} (termasuk hasil editan ChatGPT).`}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingConfirmAction(null)}
                className="px-3 py-1 bg-white border border-black rounded-lg text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={pendingConfirmAction === 'setup' ? handleConfirmedSetupSchema : handleConfirmedPullData}
                className="px-3 py-1 bg-black text-white border border-black rounded-lg text-xs font-black uppercase"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        )}

        {/* SECTION 1: Live Google Workspace OAuth & Target Spreadsheet */}
        <div className="bg-[#FFFDF6] border-2 border-black p-3 rounded-xl space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-600 block">Target Google Spreadsheet:</span>
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono font-black text-blue-700 hover:underline flex items-center gap-1"
              >
                <span className="truncate max-w-[230px] sm:max-w-xs">{activeSpreadsheetId}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>

            {isConnected ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold bg-[#A3E635] border border-black px-2 py-0.5 rounded text-black">
                  ✓ {userEmail || 'Connected'}
                </span>
                <button
                  onClick={async () => { await googleSignOut(); setIsConnected(false); setUserEmail(null); }}
                  className="text-[10px] font-bold underline text-slate-600 hover:text-black"
                >
                  Putus
                </button>
              </div>
            ) : (
              /* Official Google Sign-in Styled Button */
              <button
                onClick={handleGoogleLogin}
                disabled={isBusy}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-black px-3 py-1.5 rounded-lg text-xs font-bold shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </div>

          {/* Change URL/ID input */}
          <div className="flex gap-1.5">
            <input
              type="text"
              value={sheetIdInput}
              onChange={(e) => setSheetIdInput(e.target.value)}
              placeholder="Tempel URL atau ID Google Spreadsheet..."
              className="flex-1 px-2 py-1 border border-black rounded-lg text-[11px] font-mono bg-white"
            />
            <button
              onClick={handleSaveSheetId}
              className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase border border-black"
            >
              Simpan ID
            </button>
          </div>

          {/* 2-Way Live Sync Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setPendingConfirmAction('setup')}
              disabled={isBusy || !isConnected}
              className="comic-button bg-[#FFD000] text-black p-2 rounded-lg border border-black font-black text-[11px] uppercase flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <IconSparkles className="w-3.5 h-3.5" />
              <span>{isBusy ? 'Memproses...' : 'Setup 5 Tab + Rumus & Filter'}</span>
            </button>

            <button
              onClick={() => setPendingConfirmAction('pull')}
              disabled={isBusy || !isConnected}
              className="comic-button bg-[#00E5FF] text-black p-2 rounded-lg border border-black font-black text-[11px] uppercase flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
              <span>Tarik Data Terbaru (Baca Sheets)</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: Offline Copy TSV & CSV Fallback */}
        <div className="bg-slate-50 border border-black p-3 rounded-xl space-y-2">
          <h4 className="font-black text-[11px] uppercase text-black flex items-center gap-1.5">
            <IconCopy className="w-3.5 h-3.5" />
            Salin Cepat & Ekspor CSV (Tanpa Login)
          </h4>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={handleCopyKosManTSV}
              className="bg-white text-black p-1.5 rounded-lg border border-black font-bold text-[10px] flex items-center justify-center gap-1"
            >
              {copiedTSV ? <IconCheck className="w-3 h-3 text-green-700" /> : <IconCopy className="w-3 h-3" />}
              <span>{copiedTSV ? 'Tersalin' : 'Salin Stok'}</span>
            </button>

            <button
              onClick={handleCopyFinanceTSV}
              className="bg-white text-black p-1.5 rounded-lg border border-black font-bold text-[10px] flex items-center justify-center gap-1"
            >
              {copiedFinanceTSV ? <IconCheck className="w-3 h-3 text-green-700" /> : <IconCopy className="w-3 h-3" />}
              <span>{copiedFinanceTSV ? 'Tersalin' : 'Salin Kas'}</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="bg-white text-black p-1.5 rounded-lg border border-black font-bold text-[10px] flex items-center justify-center gap-1"
            >
              <IconDownload className="w-3 h-3" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>

        {/* SECTION 3: Manual Paste Import */}
        <div className="bg-white border border-black p-3 rounded-xl space-y-1.5">
          <h4 className="font-black text-[11px] uppercase text-black flex items-center gap-1.5">
            <IconUpload className="w-3.5 h-3.5" />
            Impor Manual via Paste Tabel Sheets
          </h4>
          <textarea
            value={pasteInputText}
            onChange={(e) => setPasteInputText(e.target.value)}
            placeholder="Tempel baris yang disalin dari Google Sheets di sini..."
            rows={2}
            className="w-full p-2 border border-black rounded-lg font-mono text-[10px]"
          />
          <button
            onClick={handleImportPastedTSV}
            className="bg-[#A3E635] text-black px-3 py-1 rounded-lg border border-black font-black text-[10px] uppercase"
          >
            Impor Baris ke KosMan
          </button>
        </div>

      </div>
    </div>
  );
};
