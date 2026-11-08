import React, { useState } from 'react';
import { KosItem } from '../types/kosman';
import { 
  IconBot, IconCopy, IconCheck, IconSparkles, IconArrowRight 
} from './icons/SvgIcons';

interface ChatGPTModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: KosItem[];
  onImportParsedItems: (parsed: { name: string; quantity: number; price: number }[]) => void;
}

export const ChatGPTModal: React.FC<ChatGPTModalProps> = ({
  isOpen,
  onClose,
  items,
  onImportParsedItems,
}) => {
  const [promptType, setPromptType] = useState<'shopping' | 'finance'>('shopping');
  const [inputReceiptText, setInputReceiptText] = useState(
    'Beli 1 Air Galon Rp 20000, 3 Mi Goreng Rp 9300, 1 Masako Rp 11000, 1 Pocari Sweat Rp 8500, 1 Es Krim Rp 12000'
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate structured prompt
  const generatedPrompt = promptType === 'shopping' 
    ? `Halo ChatGPT! Tolong bantu uraikan catatan belanja kosan berikut agar siap diimpor ke aplikasi ManageMe! KosMan & Google Sheets:

--- CATATAN STRUK BELANJA ---
${inputReceiptText}

--- INSTRUKSI OUTPUT ---
Ekstrak daftar item dalam format JSON array yang valid seperti ini:
[
  { "name": "Air Galon", "category": "Minuman & Galon", "subCategory": "Air Minum", "quantity": 1, "unit": "galon", "price": 20000 },
  { "name": "Mi Goreng", "category": "Bumbu Dapur", "subCategory": "Mie & Karbo", "quantity": 3, "unit": "bungkus", "price": 3100 }
]
Juga tampilkan tabel format Google Sheets (Tab-Separated) agar bisa langsung di-paste.`
    : `Halo ChatGPT! Tolong bantu kategorikan catatan pengeluaran harian berikut untuk ManageMe! Keuangan:

--- CATATAN KEUANGAN ---
${inputReceiptText}

--- INSTRUKSI OUTPUT ---
Kelompokkan ke dalam kategori (Makan & Minum, Belanja KosMan, Sewa Kos, Listrik, Transport, dll.) dan buatkan tabel ringkasan pengeluaran harian.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickAdd = () => {
    const lines = inputReceiptText.split(/,|\n/);
    const parsed: { name: string; quantity: number; price: number }[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const qtyMatch = line.match(/(?:beli\s+)?(\d+)?\s*(.+?)(?:\s+Rp\s*(\d+))?$/i);
      if (qtyMatch) {
        parsed.push({
          quantity: parseInt(qtyMatch[1]) || 1,
          name: (qtyMatch[2] || line).trim(),
          price: parseInt(qtyMatch[3]) || 10000,
        });
      }
    }

    if (parsed.length > 0) {
      onImportParsedItems(parsed);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-4 sm:p-6 comic-shadow-xl max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#00E5FF] border-2 border-black rounded-xl flex items-center justify-center font-black comic-shadow-sm">
              <IconBot className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg uppercase text-black leading-none">
                CHATGPT PROMPT SYNC GENERATOR
              </h3>
              <span className="text-[10px] font-bold text-slate-500 uppercase">ManageMe! AI Bridge</span>
            </div>
          </div>
          <button onClick={onClose} className="font-bold text-slate-500 hover:text-black text-lg">✕</button>
        </div>

        {/* Prompt Type Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
          <button
            onClick={() => setPromptType('shopping')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
              promptType === 'shopping' ? 'bg-[#FFD000] text-black border-black shadow-[1px_1px_0px_#000]' : 'bg-slate-100 text-slate-700'
            }`}
          >
            🛒 Struk Belanja KosMan
          </button>
          <button
            onClick={() => setPromptType('finance')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
              promptType === 'finance' ? 'bg-[#A3E635] text-black border-black shadow-[1px_1px_0px_#000]' : 'bg-slate-100 text-slate-700'
            }`}
          >
            💰 Transaksi Keuangan
          </button>
        </div>

        {/* Input Textarea */}
        <div className="space-y-1">
          <label className="block text-xs font-black uppercase text-slate-800">
            Ketik Teks Struk Bebas / Catatan Pengeluaran:
          </label>
          <textarea
            rows={3}
            value={inputReceiptText}
            onChange={(e) => setInputReceiptText(e.target.value)}
            className="w-full p-2.5 border-2 border-black rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
            placeholder="Tuliskan struk belanjaan Anda..."
          />
        </div>

        {/* Structured Prompt Output */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase text-black flex items-center gap-1">
              <IconSparkles className="w-3.5 h-3.5 text-[#FF4B82]" />
              Prompt ChatGPT Siap Salin:
            </label>
          </div>
          <pre className="p-3 bg-[#FFFDF6] border-2 border-black rounded-xl text-[11px] font-mono whitespace-pre-wrap max-h-40 overflow-y-auto text-slate-800">
            {generatedPrompt}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
          <button
            onClick={handleQuickAdd}
            className="comic-button bg-[#A3E635] text-black px-3.5 py-1.5 rounded-xl border-2 border-black font-black text-xs uppercase"
          >
            + Tambah Otomatis ke KosMan
          </button>

          <button
            onClick={handleCopy}
            className="comic-button bg-[#FFD000] text-black px-4 py-1.5 rounded-xl border-2 border-black font-black text-xs uppercase flex items-center gap-1.5"
          >
            {copied ? <IconCheck className="w-3.5 h-3.5 text-green-700" /> : <IconCopy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin!' : 'Salin Prompt ChatGPT'}
          </button>
        </div>

      </div>
    </div>
  );
};
