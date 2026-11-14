import React, { useState, useEffect } from 'react';
import { IconSheet, IconDownload, IconCopy, IconCheck, IconSparkles } from './icons/SvgIcons';
import { InlineConfirmBar, InlineNotice, PopupModal } from './InlineUI';
import {
  googleSignIn,
  googleSignInWithGis,
  googleSignInRedirect,
  googleSignInDirectOAuthRedirect,
  googleSignOut,
  getAccessToken,
  getConnectedEmail,
  getSpreadsheetId,
  setSpreadsheetId,
  setupSpreadsheetDatabase,
  pullDatabaseFromSheets,
  initGoogleAuth,
  VERCEL_PRODUCTION_DOMAIN,
  FIREBASE_CONSOLE_INFO,
  FullSpreadsheetPayload,
} from '../services/googleSheetsAutoSync';
import { ExternalLink, RefreshCw, ShieldAlert } from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullPayload: FullSpreadsheetPayload;
  onSyncPullSuccess: (pulled: Partial<FullSpreadsheetPayload>) => void;
}

/**
 * Pop-up Overlay "Set Spreadsheet Saya" (Local Storage + Google Sheets 9-Tab Sync, tanpa Firestore).
 */
export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  fullPayload,
  onSyncPullSuccess,
}) => {
  const [copiedTSV, setCopiedTSV] = useState(false);
  const [copiedFinanceTSV, setCopiedFinanceTSV] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [sheetIdInput, setSheetIdInput] = useState(getSpreadsheetId());
  const [isConnected, setIsConnected] = useState(!!getAccessToken());
  const [userEmail, setUserEmail] = useState<string | null>(getConnectedEmail());
  const [isBusy, setIsBusy] = useState(false);
  const [showRedirectHint, setShowRedirectHint] = useState(false);
  const [showVercelGuide, setShowVercelGuide] = useState(false);
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
        if (token) {
          setStatusMessage({
            type: 'success',
            text: `Berhasil login sebagai ${email}. Sinkronisasi Spreadsheet 2-arah aktif.`,
          });
        }
      },
      () => {
        setIsConnected(!!getAccessToken());
        if (!getAccessToken()) setUserEmail(null);
      },
      (errMsg) => {
        setStatusMessage({ type: 'error', text: errMsg });
        setShowRedirectHint(true);
        if (errMsg.toLowerCase().includes('domain') || errMsg.toLowerCase().includes('unauthorized')) {
          setShowVercelGuide(true);
        }
      }
    );
    return () => unsub();
  }, []);

  const activeSpreadsheetId = getSpreadsheetId();
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${activeSpreadsheetId}/edit`;
  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : VERCEL_PRODUCTION_DOMAIN;

  const handleGoogleLogin = async () => {
    setIsBusy(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setIsConnected(true);
        setUserEmail(res.email);
        setShowRedirectHint(false);
        setStatusMessage({
          type: 'success',
          text: `Berhasil login sebagai ${res.email}. Sekarang Anda bisa menekan "Setup 9 Tab Database + Rumus" atau "Tarik Data Terbaru".`,
        });
      }
    } catch (err: any) {
      const msg = err?.message || 'Gagal login Google Workspace.';
      setStatusMessage({ type: 'error', text: msg });
      setShowRedirectHint(true);
      if (msg.toLowerCase().includes('domain') || msg.toLowerCase().includes('unauthorized')) {
        setShowVercelGuide(true);
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleGisLogin = async () => {
    setIsBusy(true);
    setStatusMessage(null);
    try {
      const res = await googleSignInWithGis();
      setIsConnected(true);
      setUserEmail(res.email);
      setShowRedirectHint(false);
      setStatusMessage({
        type: 'success',
        text: `Berhasil login via GIS sebagai ${res.email}. Sinkronisasi Spreadsheet aktif.`,
      });
    } catch (err: any) {
      const msg = err?.message || 'Gagal login via Google Identity Services.';
      setStatusMessage({ type: 'error', text: msg });
      setShowRedirectHint(true);
    } finally {
      setIsBusy(false);
    }
  };

  const handleRedirectLogin = async (useDirectOAuth = false) => {
    setIsBusy(true);
    setStatusMessage(null);
    try {
      if (useDirectOAuth) {
        googleSignInDirectOAuthRedirect();
      } else {
        await googleSignInRedirect();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Gagal memulai login Mode Redirect.' });
      setShowRedirectHint(true);
      setIsBusy(false);
    }
  };

  const handleCopyDomain = (domainText: string) => {
    navigator.clipboard.writeText(domainText);
    setCopiedDomain(true);
    setStatusMessage({ type: 'info', text: `Domain "${domainText}" disalin ke clipboard.` });
    setTimeout(() => setCopiedDomain(false), 2500);
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
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title="SET SPREADSHEET SAYA (LOCAL STORAGE + GOOGLE SHEETS)"
      subtitle="Tanpa Firestore · Data lokal + sinkron otomatis 9 tab Spreadsheet setelah login Google"
      icon={<IconSheet className="w-4 h-4 text-black" />}
      headerBg="bg-[#A3E635]"
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-3">
        {/* Pop-up Status Toast Notice */}
        {statusMessage && (
          <InlineNotice
            type={statusMessage.type}
            message={statusMessage.text}
            onClose={() => setStatusMessage(null)}
          />
        )}

        {/* Popup-Blocked / Slow Unverified Flow Fallback Help */}
        {showRedirectHint && !isConnected && (
          <div className="bg-[#FFD000]/30 border-2 border-black rounded-xl p-2.5 space-y-2 text-xs font-bold">
            <div className="text-[11px] leading-snug text-slate-900">
              <strong>Tips Login Jika Jendela Tertutup / Lama ("Belum Diverifikasi Google"):</strong>{' '}
              Pada layar peringatan Google klik <em>Lanjutan (Advanced) → Buka aplikasi (tidak aman) → Centang izin Spreadsheet → Lanjutkan</em>. Agar tidak terputus di tengah jalan:
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={handleGisLogin}
                disabled={isBusy}
                className="px-2.5 py-1 bg-[#00E5FF] border border-black rounded-lg text-[11px] font-black text-black disabled:opacity-50"
              >
                Coba Pop-Up GIS (Tahan Lama)
              </button>
              {isInsideIframe && typeof window !== 'undefined' ? (
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-black text-white rounded-lg text-[11px] font-black flex items-center gap-1"
                >
                  <span>Buka di Tab Baru (Rekomendasi)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleRedirectLogin(false)}
                    disabled={isBusy}
                    className="px-2.5 py-1 bg-black text-white rounded-lg text-[11px] font-black disabled:opacity-50"
                  >
                    Mode Redirect (Anti Pop-Up)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRedirectLogin(true)}
                    disabled={isBusy}
                    className="px-2.5 py-1 bg-white border border-black rounded-lg text-[11px] font-black text-black disabled:opacity-50"
                  >
                    Redirect OAuth Langsung
                  </button>
                </>
              )}
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
          className={`border-2 border-black p-3 rounded-xl space-y-2.5 ${
            isConnected ? 'bg-[#A3E635]/20' : 'bg-[#FFD000]/25'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex-1 min-w-[200px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase text-black">
                  Langkah 1: Login Akun Google (Izin Baca/Tulis Spreadsheet)
                </span>
                <button
                  type="button"
                  onClick={() => setShowVercelGuide((v) => !v)}
                  className="text-[10px] font-black underline text-slate-700 hover:text-black flex items-center gap-0.5"
                >
                  <ShieldAlert className="w-3 h-3" />
                  <span>{showVercelGuide ? 'Tutup Panduan Vercel' : 'Panduan Domain Vercel'}</span>
                </button>
              </div>
              <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                {isConnected
                  ? `Terhubung sebagai ${userEmail || 'Google Account'}. Sinkronisasi otomatis aktif.`
                  : 'Jika pop-up Google tertutup saat proses "Lanjutan" lama, gunakan Pop-Up GIS atau Mode Redirect (di Tab Penuh / Vercel).'}
              </p>
            </div>

            {isConnected && (
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
            )}
          </div>

          {!isConnected && (
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
                <span>{isBusy ? 'Memproses Login...' : 'Sign in with Google'}</span>
              </button>

              <button
                type="button"
                onClick={handleGisLogin}
                disabled={isBusy}
                className="px-2.5 py-1.5 bg-[#00E5FF] text-black border-2 border-black rounded-lg text-[11px] font-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                title="Menggunakan Google Identity Services langsung tanpa timeout popup Firebase"
              >
                Pop-Up GIS (Tahan Lama)
              </button>

              {isInsideIframe && typeof window !== 'undefined' ? (
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-slate-900 text-white border-2 border-black rounded-lg text-[11px] font-black flex items-center gap-1 shadow-[2px_2px_0px_#000]"
                  title="Buka aplikasi di tab browser penuh agar Mode Redirect berfungsi tanpa terblokir iframe"
                >
                  <span>Tab Baru</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRedirectLogin(false)}
                  disabled={isBusy}
                  className="px-2.5 py-1.5 bg-slate-900 text-white border-2 border-black rounded-lg text-[11px] font-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                  title="Login satu tab tanpa jendela pop-up (anti jendela tertutup saat verifikasi lama)"
                >
                  Mode Redirect (Anti Pop-Up)
                </button>
              )}
            </div>
          )}

          {/* Panduan Konfigurasi Domain Vercel & Firebase */}
          {showVercelGuide && (
            <div className="bg-white border-2 border-black rounded-xl p-2.5 space-y-1.5 text-[11px]">
              <div className="font-black text-black uppercase flex flex-wrap items-center justify-between gap-2">
                <span>Checklist Domain Auth Vercel ({VERCEL_PRODUCTION_DOMAIN})</span>
                <button
                  type="button"
                  onClick={() => handleCopyDomain(VERCEL_PRODUCTION_DOMAIN)}
                  className="px-2 py-0.5 bg-[#FFD000] border border-black rounded font-black text-[10px] flex items-center gap-1"
                >
                  {copiedDomain ? <IconCheck className="w-3 h-3" /> : <IconCopy className="w-3 h-3" />}
                  <span>Salin {VERCEL_PRODUCTION_DOMAIN}</span>
                </button>
              </div>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-700 font-semibold">
                <li>
                  Buka <strong>Firebase Console</strong> (Project: <code className="bg-slate-100 px-1 rounded">{FIREBASE_CONSOLE_INFO.projectId}</code>) →{' '}
                  <strong>Authentication → Settings → Authorized domains → Add domain</strong> → masukkan{' '}
                  <code className="bg-slate-100 px-1 rounded">{VERCEL_PRODUCTION_DOMAIN}</code>
                  {currentHost && currentHost !== VERCEL_PRODUCTION_DOMAIN && currentHost !== 'localhost' ? (
                    <> (dan host aktif: <code className="bg-slate-100 px-1 rounded">{currentHost}</code>)</>
                  ) : null}.
                </li>
                <li>
                  Untuk <strong>Pop-Up GIS / Redirect OAuth Langsung</strong> di Google Cloud Console → <strong>Credentials → OAuth 2.0 Client</strong>, tambahkan{' '}
                  <code className="bg-slate-100 px-1 rounded">https://{VERCEL_PRODUCTION_DOMAIN}</code> ke <em>Authorized JavaScript origins</em> dan <em>Authorized redirect URIs</em> (<code className="bg-slate-100 px-1 rounded">https://{VERCEL_PRODUCTION_DOMAIN}/</code>).
                </li>
                <li>
                  Jika layar <em>"Google belum memverifikasi aplikasi ini"</em> muncul: tambahkan email Anda di <strong>OAuth consent screen → Test users</strong>, atau klik <strong>Lanjutan → Buka app → Centang semua izin → Lanjutkan</strong> memakai <strong>Mode Redirect</strong>.
                </li>
              </ol>
            </div>
          )}
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
    </PopupModal>
  );
};
