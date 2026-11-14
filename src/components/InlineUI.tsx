import React, { useState } from 'react';
import {
  IconChevronDown,
  IconChevronUp,
  IconCheck,
  IconAlert,
  IconCheckCircle,
  IconCamera,
  IconReceipt,
  IconSparkles,
  IconSearch,
  IconTrash,
} from './icons/SvgIcons';
import { KOS_CATEGORIES, normalizeKosCategory } from '../data/kosmanItems';
import { KosCategory, KosItem } from '../types/kosman';

export interface DropdownOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface InlineDropdownProps {
  label?: string;
  value: string;
  options: (string | DropdownOption)[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  accentColor?: string;
}

/**
 * Dropdown menyatu langsung ke dalam alur halaman (accordion ke bawah),
 * bukan pop-up native <select> atau overlay melayang.
 */
export const InlineDropdown: React.FC<InlineDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Pilih opsi...',
  searchable = false,
  className = '',
  accentColor = 'bg-white',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const normalized: DropdownOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalized.find((o) => o.value === value);

  const filtered = normalized.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      (o.sublabel || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <span className="block text-[10px] font-black uppercase text-slate-700 mb-1">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-2.5 py-2 border-2 border-black rounded-lg text-xs font-bold text-left flex items-center justify-between gap-2 transition-colors ${accentColor} hover:bg-slate-50`}
      >
        <span className="truncate text-black">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {isOpen ? (
          <IconChevronUp className="w-3.5 h-3.5 text-black shrink-0" />
        ) : (
          <IconChevronDown className="w-3.5 h-3.5 text-black shrink-0" />
        )}
      </button>

      {/* Accordion In-Flow Options List (Mengalir ke bawah, menyatu dengan website) */}
      {isOpen && (
        <div className="mt-1 border-2 border-black rounded-lg bg-[#FFFDF6] overflow-hidden shadow-[2px_2px_0px_#000]">
          {(searchable || normalized.length > 7) && (
            <div className="p-1.5 border-b border-black bg-white relative">
              <IconSearch className="w-3 h-3 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari pilihan..."
                className="w-full pl-6 pr-2 py-1 text-[11px] font-bold border border-black rounded bg-[#FFFDF6] focus:outline-none"
              />
            </div>
          )}

          <div className="max-h-48 overflow-y-auto divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <div className="p-2 text-[11px] font-bold text-slate-500 text-center">
                Tidak ada pilihan cocok
              </div>
            ) : (
              filtered.map((opt) => {
                const active = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full px-2.5 py-2 text-left text-xs font-bold flex items-center justify-between gap-2 transition-colors ${
                      active
                        ? 'bg-[#FFD000] text-black font-black'
                        : 'bg-white hover:bg-[#FFFDF6] text-slate-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="block truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="block text-[10px] font-medium text-slate-500 truncate">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {active && <IconCheck className="w-3.5 h-3.5 text-black shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface InlineConfirmBarProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Pengganti window.confirm & pop-up dialog hapus: menyatu di dalam halaman.
 */
export const InlineConfirmBar: React.FC<InlineConfirmBarProps> = ({
  title,
  description,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  danger = true,
  onConfirm,
  onCancel,
}) => (
  <div
    className={`border-2 border-black rounded-xl p-2.5 sm:p-3 space-y-2 shadow-[3px_3px_0px_#000] ${
      danger ? 'bg-[#FFD000]' : 'bg-[#00E5FF]'
    }`}
  >
    <div className="flex items-start gap-2">
      <IconAlert className="w-4 h-4 text-black shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-black text-black leading-snug">{title}</p>
        {description && (
          <p className="text-[11px] font-bold text-slate-900 mt-0.5 leading-snug">
            {description}
          </p>
        )}
      </div>
    </div>
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={onCancel}
        className="px-2.5 py-1 bg-white border border-black rounded-lg text-[11px] font-bold text-black hover:bg-slate-100"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className={`px-3 py-1 border border-black rounded-lg text-[11px] font-black uppercase ${
          danger ? 'bg-[#FF4B82] text-white' : 'bg-black text-white'
        }`}
      >
        {confirmLabel}
      </button>
    </div>
  </div>
);

interface InlineNoticeProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
}

/**
 * Pengganti window.alert & floating toast pop-up: menyatu di aliran konten.
 */
export const InlineNotice: React.FC<InlineNoticeProps> = ({ type, message, onClose }) => (
  <div
    className={`border-2 border-black rounded-xl p-2.5 text-xs font-bold flex items-center justify-between gap-2 shadow-[2px_2px_0px_#000] ${
      type === 'success'
        ? 'bg-[#A3E635] text-black'
        : type === 'error'
        ? 'bg-[#FF4B82] text-white'
        : 'bg-[#00E5FF] text-black'
    }`}
  >
    <div className="flex items-center gap-2 min-w-0">
      {type === 'success' ? (
        <IconCheckCircle className="w-4 h-4 shrink-0" />
      ) : (
        <IconAlert className="w-4 h-4 shrink-0" />
      )}
      <span className="leading-snug">{message}</span>
    </div>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        className="px-1.5 py-0.5 text-xs font-black border border-black rounded bg-white text-black shrink-0"
      >
        Tutup
      </button>
    )}
  </div>
);

// ==================== UNIFIED AI SCANNER (SCAN NOTA & SCAN STOK) ====================

export interface OcrExtractedItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  suggestedCategory?: string;
  subCategory?: string;
}

export interface ScannedStockItem {
  name: string;
  quantity: number;
  unit: string;
  category: KosCategory;
  subCategory: string;
  conditionNote?: string;
}

interface InlineScannerPanelProps {
  defaultMode?: 'nota' | 'stok';
  kosItems: KosItem[];
  onApplyNotaResult: (payload: {
    storeName: string;
    totalAmount: number;
    date: string;
    time: string;
    category: string;
    note: string;
    items: OcrExtractedItem[];
    alsoUpdateKosMan: boolean;
    account: 'Kas' | 'Bank' | 'E-Wallet';
  }) => void;
  onApplyStockScanResult: (detectedItems: ScannedStockItem[]) => void;
  onClose?: () => void;
}

export const InlineScannerPanel: React.FC<InlineScannerPanelProps> = ({
  defaultMode = 'nota',
  kosItems,
  onApplyNotaResult,
  onApplyStockScanResult,
  onClose,
}) => {
  const [scanMode, setScanMode] = useState<'nota' | 'stok'>(defaultMode);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Nota Preview State
  const [notaPreview, setNotaPreview] = useState<{
    storeName: string;
    totalAmount: number;
    date: string;
    time: string;
    category: string;
    note: string;
    items: OcrExtractedItem[];
  } | null>(null);
  const [notaAccount, setNotaAccount] = useState<'Kas' | 'Bank' | 'E-Wallet'>('Kas');
  const [alsoUpdateKos, setAlsoUpdateKos] = useState(true);

  // Stock Preview State
  const [stockSummary, setStockSummary] = useState('');
  const [stockPreview, setStockPreview] = useState<ScannedStockItem[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setNotaPreview(null);
    setStockPreview([]);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Gagal membaca gambar.'));
        reader.readAsDataURL(file);
      });

      if (scanMode === 'nota') {
        const res = await fetch('/api/gemini/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg',
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Gagal memindai nota');
        }
        const d = json.data || {};
        const now = new Date();
        const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setNotaPreview({
          storeName: d.storeName || 'Toko / Minimarket',
          totalAmount: Number(d.totalAmount) || 0,
          date: d.date || now.toISOString().split('T')[0],
          time: d.time || hhmm,
          category: d.category || 'Belanja KosMan',
          note: d.note || `Belanja di ${d.storeName || 'Toko'}`,
          items: Array.isArray(d.items) ? d.items : [],
        });
      } else {
        const res = await fetch('/api/gemini/scan-stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg',
            existingItemNames: kosItems.map((k) => k.name),
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Gagal memindai foto stok');
        }
        const d = json.data || {};
        setStockSummary(d.summary || 'Barang kos terdeteksi dari foto.');
        const mapped: ScannedStockItem[] = (Array.isArray(d.detectedItems) ? d.detectedItems : []).map(
          (it: any) => {
            const cat = normalizeKosCategory(it.category || 'Keperluan Rumah Tangga');
            const defaultSub =
              KOS_CATEGORIES.find((c) => c.name === cat)?.subCategories[0] || 'Umum';
            return {
              name: String(it.name || 'Barang').trim(),
              quantity: Math.max(0, Number(it.quantity) || 1),
              unit: String(it.unit || 'buah').trim(),
              category: cat,
              subCategory: it.subCategory || defaultSub,
              conditionNote: it.conditionNote || '',
            };
          }
        );
        setStockPreview(mapped);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat memproses gambar.');
    } finally {
      setIsScanning(false);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white border-2 border-black rounded-xl p-3 space-y-2.5 shadow-[3px_3px_0px_#000]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#00E5FF] border border-black rounded-lg flex items-center justify-center">
            <IconSparkles className="w-4 h-4 text-black" />
          </div>
          <div>
            <h4 className="font-display font-black text-xs sm:text-sm uppercase text-black leading-none">
              AI Scanner Terintegrasi (Nota & Cek Stok)
            </h4>
            <p className="text-[10px] font-bold text-slate-600">
              Otomatis perbarui Keuangan, Stok KosMan, Riwayat, & Google Spreadsheet
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-0.5 bg-slate-100 border border-black rounded text-[11px] font-black text-black"
          >
            Tutup
          </button>
        )}
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-1.5 bg-[#FFFDF6] border border-black p-1 rounded-lg">
        <button
          type="button"
          onClick={() => {
            setScanMode('nota');
            setErrorMsg(null);
          }}
          className={`py-1.5 px-2 rounded-md text-xs font-black flex items-center justify-center gap-1.5 transition-colors ${
            scanMode === 'nota'
              ? 'bg-[#FFD000] text-black border border-black'
              : 'text-slate-700 hover:bg-white'
          }`}
        >
          <IconReceipt className="w-3.5 h-3.5" />
          <span>Scan Nota Belanja</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setScanMode('stok');
            setErrorMsg(null);
          }}
          className={`py-1.5 px-2 rounded-md text-xs font-black flex items-center justify-center gap-1.5 transition-colors ${
            scanMode === 'stok'
              ? 'bg-[#00E5FF] text-black border border-black'
              : 'text-slate-700 hover:bg-white'
          }`}
        >
          <IconCamera className="w-3.5 h-3.5" />
          <span>Scan Stok Rak / Barang</span>
        </button>
      </div>

      {/* Upload / Camera Trigger */}
      <label className="w-full cursor-pointer border-2 border-dashed border-black rounded-xl p-3 bg-[#FFFDF6] hover:bg-[#FFD000]/20 flex flex-col items-center justify-center gap-1 text-center transition-colors">
        <IconCamera className="w-6 h-6 text-black" />
        <span className="text-xs font-black text-black">
          {isScanning
            ? 'Sedang menganalisis foto dengan Gemini AI...'
            : scanMode === 'nota'
            ? 'Ambil Foto / Unggah Struk Belanja'
            : 'Ambil Foto Kulkas / Rak Dapur / Barang Kos'}
        </span>
        <span className="text-[10px] font-bold text-slate-600">
          {scanMode === 'nota'
            ? 'Otomatis baca toko, total harga, tanggal/jam, & rincian barang'
            : 'Otomatis mendeteksi barang terlihat & memperbarui jumlah stok di KosMan + Sheet'}
        </span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          disabled={isScanning}
          className="hidden"
        />
      </label>

      {errorMsg && <InlineNotice type="error" message={errorMsg} onClose={() => setErrorMsg(null)} />}
      {successMsg && (
        <InlineNotice type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}

      {/* Nota Result Preview */}
      {scanMode === 'nota' && notaPreview && (
        <div className="bg-[#FFFDF6] border-2 border-black rounded-xl p-3 space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="block text-[10px] font-black uppercase text-slate-600">Toko</span>
              <input
                type="text"
                value={notaPreview.storeName}
                onChange={(e) => setNotaPreview({ ...notaPreview, storeName: e.target.value })}
                className="w-full px-2 py-1 border border-black rounded text-xs font-bold bg-white"
              />
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase text-slate-600">Total Harga (Rp)</span>
              <input
                type="number"
                value={notaPreview.totalAmount}
                onChange={(e) =>
                  setNotaPreview({ ...notaPreview, totalAmount: Number(e.target.value) || 0 })
                }
                className="w-full px-2 py-1 border border-black rounded text-xs font-mono font-black bg-white tabular-nums"
              />
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase text-slate-600">Tanggal</span>
              <input
                type="date"
                value={notaPreview.date}
                onChange={(e) => setNotaPreview({ ...notaPreview, date: e.target.value })}
                className="w-full px-2 py-1 border border-black rounded text-xs font-mono bg-white"
              />
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase text-slate-600">Jam</span>
              <input
                type="time"
                value={notaPreview.time}
                onChange={(e) => setNotaPreview({ ...notaPreview, time: e.target.value })}
                className="w-full px-2 py-1 border border-black rounded text-xs font-mono bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <InlineDropdown
              label="Kategori Pengeluaran"
              value={notaPreview.category}
              options={[
                'Makan & Minum',
                'Belanja KosMan',
                'Bumbu Dapur',
                'Keperluan Rumah Tangga',
                'Kebersihan & Toilet',
                'Kesehatan',
                'Kelistrikan & Kos',
                'Keinginan',
                'Transportasi',
                'Lainnya',
              ]}
              onChange={(val) => setNotaPreview({ ...notaPreview, category: val })}
            />
            <InlineDropdown
              label="Akun Pembayaran"
              value={notaAccount}
              options={['Kas', 'Bank', 'E-Wallet']}
              onChange={(val) => setNotaAccount(val as 'Kas' | 'Bank' | 'E-Wallet')}
            />
          </div>

          {notaPreview.items.length > 0 && (
            <div className="border border-black rounded-lg overflow-hidden bg-white">
              <div className="bg-slate-100 px-2.5 py-1 border-b border-black flex items-center justify-between text-[10px] font-black uppercase">
                <span>Item Terbaca ({notaPreview.items.length})</span>
                <span>Total Baris</span>
              </div>
              <div className="divide-y divide-slate-200 max-h-40 overflow-y-auto text-xs">
                {notaPreview.items.map((it, idx) => (
                  <div key={idx} className="px-2.5 py-1.5 flex items-center justify-between gap-2">
                    <span className="font-bold text-black truncate">
                      {it.name} ({it.quantity} {it.unit || 'buah'})
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold tabular-nums">
                        Rp {(Number(it.price) || 0).toLocaleString('id-ID')}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setNotaPreview({
                            ...notaPreview,
                            items: notaPreview.items.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-slate-400 hover:text-red-600"
                        title="Hapus baris"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-xs font-bold text-black cursor-pointer">
            <input
              type="checkbox"
              checked={alsoUpdateKos}
              onChange={(e) => setAlsoUpdateKos(e.target.checked)}
              className="w-4 h-4 accent-black"
            />
            <span>Sekaligus tambah stok & catat riwayat pembelian barang ke KosMan + Spreadsheet</span>
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setNotaPreview(null)}
              className="px-3 py-1.5 bg-white border border-black rounded-lg text-xs font-bold"
            >
              Batalkan
            </button>
            <button
              type="button"
              onClick={() => {
                onApplyNotaResult({
                  ...notaPreview,
                  alsoUpdateKosMan: alsoUpdateKos,
                  account: notaAccount,
                });
                setNotaPreview(null);
                setSuccessMsg('Nota berhasil dicatat ke Keuangan, KosMan, & disinkronkan ke Spreadsheet.');
              }}
              className="px-3 py-1.5 bg-[#A3E635] text-black border border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000]"
            >
              Simpan & Sync Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Stock Scan Result Preview */}
      {scanMode === 'stok' && stockPreview.length > 0 && (
        <div className="bg-[#FFFDF6] border-2 border-black rounded-xl p-3 space-y-2.5">
          <div className="text-xs font-black text-black">
            Hasil Cek Stok AI ({stockPreview.length} barang):{' '}
            <span className="font-bold text-slate-600">{stockSummary}</span>
          </div>

          <div className="border border-black rounded-lg overflow-hidden bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-900 text-white text-[10px] uppercase">
                <tr>
                  <th className="p-2">Nama Barang</th>
                  <th className="p-2">Kategori</th>
                  <th className="p-2 text-right">Stok Terdeteksi</th>
                  <th className="p-2 text-center">Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {stockPreview.map((st, idx) => (
                  <tr key={idx}>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={st.name}
                        onChange={(e) => {
                          const next = [...stockPreview];
                          next[idx] = { ...next[idx], name: e.target.value };
                          setStockPreview(next);
                        }}
                        className="w-full px-1.5 py-1 border border-black rounded text-xs font-bold"
                      />
                    </td>
                    <td className="p-1.5 text-[11px] font-bold text-slate-700">{st.category}</td>
                    <td className="p-1.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          value={st.quantity}
                          onChange={(e) => {
                            const next = [...stockPreview];
                            next[idx] = { ...next[idx], quantity: Math.max(0, Number(e.target.value) || 0) };
                            setStockPreview(next);
                          }}
                          className="w-14 px-1.5 py-1 border border-black rounded text-xs font-mono font-black text-right tabular-nums"
                        />
                        <span className="text-[10px] font-bold text-slate-600">{st.unit}</span>
                      </div>
                    </td>
                    <td className="p-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => setStockPreview(stockPreview.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setStockPreview([])}
              className="px-3 py-1.5 bg-white border border-black rounded-lg text-xs font-bold"
            >
              Batalkan
            </button>
            <button
              type="button"
              onClick={() => {
                onApplyStockScanResult(stockPreview);
                setStockPreview([]);
                setSuccessMsg('Stok KosMan berhasil diperbarui dari foto rak & disinkronkan ke Spreadsheet.');
              }}
              className="px-3 py-1.5 bg-[#00E5FF] text-black border border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000]"
            >
              Update Stok & Sync Sheet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
