import React, { useState } from 'react';
import { KosItem, KosCategory } from '../types/kosman';
import { KOS_CATEGORIES, normalizeKosCategory } from '../data/kosmanItems';
import { getSpreadsheetId } from '../services/googleSheetsAutoSync';
import { 
  IconBot, IconCopy, IconCheck, IconSparkles, IconShoppingBag 
} from './icons/SvgIcons';

interface ChatGPTModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: KosItem[];
  onImportParsedItems: (parsed: { name: string; quantity: number; price: number; category?: KosCategory }[]) => void;
  onImportParsedWishlist?: (parsed: { name: string; quantity: number; price: number; category?: KosCategory }[]) => void;
}

export const ChatGPTModal: React.FC<ChatGPTModalProps> = ({
  isOpen,
  onClose,
  items,
  onImportParsedItems,
  onImportParsedWishlist,
}) => {
  const [promptType, setPromptType] = useState<'shopping' | 'finance' | 'sheets'>('sheets');
  const [inputReceiptText, setInputReceiptText] = useState(
    'Beli 1 Air Galon Rp 20000, 3 Mi Goreng Rp 9300, 1 Nugget Ayam Rp 48000, 1 Token Listrik PLN Rp 50000'
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activeSheetId = getSpreadsheetId();
  const categoryList = KOS_CATEGORIES.map(c => c.name).join(', ');

  const generatedPrompt =
    promptType === 'sheets'
      ? `Halo ChatGPT! Saya menghubungkan Google Spreadsheet ini sebagai database 2-arah aplikasi ManageMe! (KosMan, Wishlist, Keuangan & Budget Kos):
Link Spreadsheet: https://docs.google.com/spreadsheets/d/${activeSheetId}/edit

Struktur 5 Tab Database di Spreadsheet:
1. Dashboard_Ringkasan (Berisi rumus SUMIF, SUMIFS, ISOWEEKNUM, COUNTIF otomatis - JANGAN ubah rumus)
2. KosMan_Inventaris: Kolom [ID | Nama_Item | Kategori_Utama | Multi_Tags | Sub_Kategori | Stok | Satuan | Min_Stok | Harga_Satuan | Total_Nilai(rumus) | Status_Stok(rumus) | Catatan | Terakhir_Diubah]
3. Wishlist_Belanja: Kolom [ID | Nama_Barang | Kategori_Belanja | Sub_Kategori | Qty_Beli | Estimasi_Harga | Subtotal(rumus) | Sudah_Dibeli(TRUE/FALSE) | Prioritas(Wajib/Sedang/Keinginan) | Sumber]
4. Keuangan_Transaksi: Kolom [ID | Tanggal(YYYY-MM-DD) | Minggu_Ke(rumus) | Tipe(Pemasukan/Pengeluaran) | Kategori | Sub_Kategori | Keterangan | Nominal | Akun(Kas/Bank/E-Wallet) | Sumber]
5. Kos_Budget_Simulasi: Kolom [ID | Pos_Anggaran | Budget_Mingguan | Alokasi_Persen | Terpakai_Minggu_Ini(rumus) | Sisa_Budget(rumus) | Kategori_Terkait_Regex | Status(rumus)]

Kategori resmi yang digunakan: ${categoryList}.
Setiap barang boleh memiliki Multi_Tags dipisah koma (misal: "Makanan, Keperluan Rumah Tangga, Belanja").

Tolong proses catatan/foto nota berikut dan buatkan baris siap tempel (Tab-Separated) ke tab yang sesuai:
${inputReceiptText}`
      : promptType === 'shopping'
      ? `Halo ChatGPT! Tolong uraikan catatan belanja / grocery wishlist berikut agar siap diimpor ke ManageMe! KosMan:

--- CATATAN BELANJA / NOTA ---
${inputReceiptText}

--- KATEGORI TERSEDIA ---
${categoryList}

--- INSTRUKSI OUTPUT ---
Ekstrak daftar item dalam format JSON array valid dengan multi-tag kategori, contoh:
[
  { "name": "Nugget Ayam", "category": "Makanan", "tags": ["Makanan", "Keperluan Rumah Tangga"], "subCategory": "Frozen Food & Siap Saji", "quantity": 1, "unit": "bungkus", "price": 48000 },
  { "name": "Token Listrik PLN", "category": "Kelistrikan & Kos", "tags": ["Kelistrikan & Kos"], "subCategory": "Listrik & Token PLN", "quantity": 1, "unit": "kali", "price": 50000 }
]
Sertakan juga versi Tab-Separated (TSV) untuk ditempel ke tab KosMan_Inventaris atau Wishlist_Belanja.`
      : `Halo ChatGPT! Tolong kategorikan catatan pemasukan/pengeluaran harian & simulasi pos kos berikut untuk ManageMe! Keuangan:

--- CATATAN TRANSAKSI ---
${inputReceiptText}

--- POS ANGGARAN KOS MINGGUAN ---
- Listrik, Air & Kos
- Makan & Minum
- Belanja Dapur & Kebersihan
- Tabungan Wajib
- Keinginan & Transport

Buatkan tabel ringkasan per hari (Senin-Minggu) + format TSV siap tempel ke tab Keuangan_Transaksi!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseInputLines = () => {
    const lines = inputReceiptText.split(/,|\n/);
    const parsed: { name: string; quantity: number; price: number; category?: KosCategory }[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const qtyMatch = line.match(/(?:beli\s+)?(\d+)?\s*(.+?)(?:\s+Rp\s*([\d.]+))?$/i);
      if (qtyMatch) {
        const cleanPrice = qtyMatch[3] ? parseInt(qtyMatch[3].replace(/\./g, ''), 10) : 10000;
        const itemName = (qtyMatch[2] || line).trim();
        const existing = items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
        parsed.push({
          quantity: parseInt(qtyMatch[1]) || 1,
          name: itemName,
          price: cleanPrice || existing?.price || 10000,
          category: existing ? normalizeKosCategory(existing.category) : undefined,
        });
      }
    }
    return parsed;
  };

  const handleQuickAddKosMan = () => {
    const parsed = parseInputLines();
    if (parsed.length > 0) {
      onImportParsedItems(parsed);
      onClose();
    }
  };

  const handleQuickAddWishlist = () => {
    const parsed = parseInputLines();
    if (parsed.length > 0 && onImportParsedWishlist) {
      onImportParsedWishlist(parsed);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
      <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-3.5 sm:p-5 comic-shadow-xl max-w-2xl w-full space-y-3 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00E5FF] border-2 border-black rounded-xl flex items-center justify-center font-black comic-shadow-sm">
              <IconBot className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm sm:text-base uppercase text-black leading-none">
                CHATGPT & SHEETS SYNC BRIDGE
              </h3>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Terhubung ke Spreadsheet 2-Arah
              </span>
            </div>
          </div>
          <button onClick={onClose} className="font-bold text-slate-500 hover:text-black text-base px-1">✕</button>
        </div>

        {/* Prompt Type Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
          <button
            onClick={() => setPromptType('sheets')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-black whitespace-nowrap transition-all border border-black ${
              promptType === 'sheets' ? 'bg-[#FFD000] text-black shadow-[1px_1px_0px_#000]' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Bridge Spreadsheet 2-Arah
          </button>
          <button
            onClick={() => setPromptType('shopping')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-black whitespace-nowrap transition-all border border-black ${
              promptType === 'shopping' ? 'bg-[#00E5FF] text-black shadow-[1px_1px_0px_#000]' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Struk & Wishlist KosMan
          </button>
          <button
            onClick={() => setPromptType('finance')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-black whitespace-nowrap transition-all border border-black ${
              promptType === 'finance' ? 'bg-[#A3E635] text-black shadow-[1px_1px_0px_#000]' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Transaksi & Simulasi Kos
          </button>
        </div>

        {/* Input Textarea */}
        <div className="space-y-1">
          <label className="block text-[11px] font-black uppercase text-slate-800">
            Ketik Catatan Belanja / Nota / Pemasukan Harian:
          </label>
          <textarea
            rows={3}
            value={inputReceiptText}
            onChange={(e) => setInputReceiptText(e.target.value)}
            className="w-full p-2 border-2 border-black rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
            placeholder="Tuliskan struk belanjaan atau pemasukan harian..."
          />
        </div>

        {/* Structured Prompt Output */}
        <div className="space-y-1">
          <label className="text-[11px] font-black uppercase text-black flex items-center gap-1">
            <IconSparkles className="w-3.5 h-3.5 text-[#FF4B82]" />
            Prompt ChatGPT Siap Salin:
          </label>
          <pre className="p-2.5 bg-[#FFFDF6] border-2 border-black rounded-xl text-[10px] font-mono whitespace-pre-wrap max-h-40 overflow-y-auto text-slate-800">
            {generatedPrompt}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={handleQuickAddKosMan}
              className="comic-button bg-[#A3E635] text-black px-2.5 py-1.5 rounded-lg border border-black font-black text-[10px] uppercase"
            >
              + Masuk Stok KosMan
            </button>
            {onImportParsedWishlist && (
              <button
                onClick={handleQuickAddWishlist}
                className="comic-button bg-[#00E5FF] text-black px-2.5 py-1.5 rounded-lg border border-black font-black text-[10px] uppercase flex items-center gap-1"
              >
                <IconShoppingBag className="w-3 h-3" />
                + Masuk Wishlist
              </button>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="comic-button bg-[#FFD000] text-black px-3.5 py-1.5 rounded-lg border-2 border-black font-black text-[11px] uppercase flex items-center gap-1.5"
          >
            {copied ? <IconCheck className="w-3.5 h-3.5 text-green-700" /> : <IconCopy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin!' : 'Salin Prompt ChatGPT'}
          </button>
        </div>

      </div>
    </div>
  );
};
