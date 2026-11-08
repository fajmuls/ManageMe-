import React, { useState } from 'react';
import { KosItem, FinanceRecord } from '../types/kosman';
import { 
  IconSheet, IconDownload, IconCopy, IconCheck, 
  IconUpload, IconCheckCircle, IconAlert 
} from './icons/SvgIcons';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: KosItem[];
  financeRecords: FinanceRecord[];
  onUpdateAllItems: (newItems: KosItem[]) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  items,
  financeRecords,
  onUpdateAllItems,
}) => {
  const [copiedTSV, setCopiedTSV] = useState(false);
  const [copiedFinanceTSV, setCopiedFinanceTSV] = useState(false);
  const [pasteInputText, setPasteInputText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  if (!isOpen) return null;

  // 1-Click Copy Tab-Separated Data for Direct Paste into Google Sheets
  const handleCopyKosManTSV = () => {
    const headers = ['ID', 'Nama Barang', 'Kategori', 'Sub Kategori', 'Jumlah Stok', 'Satuan', 'Harga Satuan (IDR)', 'Status'];
    const rows = items.map(item => [
      item.id,
      item.name,
      item.category,
      item.subCategory,
      item.quantity,
      item.unit,
      item.price,
      item.quantity === 0 ? 'HABIS' : item.quantity <= item.minThreshold ? 'LOW' : 'AMAN'
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent);
    setCopiedTSV(true);
    setStatusMessage({ type: 'success', text: 'Tabel inventaris tersalin! Buka Google Sheets dan tekan Ctrl+V (Paste) pada sel A1.' });
    setTimeout(() => setCopiedTSV(false), 3000);
  };

  const handleCopyFinanceTSV = () => {
    const headers = ['Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Nominal (IDR)', 'Akun'];
    const rows = financeRecords.map(f => [
      f.date,
      f.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      f.category,
      f.note,
      f.amount,
      f.account
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent);
    setCopiedFinanceTSV(true);
    setStatusMessage({ type: 'success', text: 'Tabel transaksi keuangan tersalin! Tempelkan (Ctrl+V) langsung ke Google Sheets Anda.' });
    setTimeout(() => setCopiedFinanceTSV(false), 3000);
  };

  // Download CSV File for Google Sheets
  const handleDownloadCSV = () => {
    const headers = ['id,name,category,subCategory,quantity,unit,price,minThreshold'];
    const rows = items.map(i => 
      `"${i.id}","${i.name.replace(/"/g, '""')}","${i.category}","${i.subCategory}",${i.quantity},"${i.unit}",${i.price},${i.minThreshold}`
    );
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ManageMe_KosMan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setStatusMessage({ type: 'success', text: 'File CSV berhasil diunduh. Anda bisa langsung File > Import di Google Sheets.' });
  };

  // Import from Pasted Google Sheets TSV Text
  const handleImportPastedTSV = () => {
    if (!pasteInputText.trim()) {
      setStatusMessage({ type: 'error', text: 'Silakan tempel baris dari Google Sheets terlebih dahulu.' });
      return;
    }

    try {
      const lines = pasteInputText.trim().split('\n');
      const newItems: KosItem[] = [];

      lines.forEach((line, idx) => {
        const cols = line.split('\t');
        if (cols.length >= 2) {
          // If first row is header, skip
          if (idx === 0 && (cols[0].toLowerCase().includes('id') || cols[1].toLowerCase().includes('nama'))) {
            return;
          }

          const name = cols[1] || cols[0];
          const cat = (cols[2] as any) || 'Bumbu Dapur';
          const sub = cols[3] || 'Umum';
          const qty = parseInt(cols[4]) || 1;
          const unit = cols[5] || 'buah';
          const price = parseInt(cols[6]) || 10000;

          newItems.push({
            id: 'sheets-' + Date.now() + '-' + idx,
            name: name.trim(),
            category: cat,
            subCategory: sub,
            quantity: qty,
            unit: unit.trim(),
            price: price,
            timesPurchased: 0,
            totalSpend: 0,
            minThreshold: 1,
            lastPurchasedDate: new Date().toISOString().split('T')[0]
          });
        }
      });

      if (newItems.length > 0) {
        onUpdateAllItems(newItems);
        setStatusMessage({ type: 'success', text: `Berhasil mengimpor ${newItems.length} barang dari Google Sheets!` });
        setPasteInputText('');
      } else {
        setStatusMessage({ type: 'error', text: 'Tidak ada baris data valid yang terdeteksi.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Gagal mengurai data Google Sheets.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-4 sm:p-6 comic-shadow-xl max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#A3E635] border-2 border-black rounded-xl flex items-center justify-center font-black comic-shadow-sm">
              <IconSheet className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg uppercase text-black leading-none">
                INTEGRASI GOOGLE SHEETS
              </h3>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Sinkronisasi & Ekspor Tanpa Login</span>
            </div>
          </div>
          <button onClick={onClose} className="font-bold text-slate-500 hover:text-black text-lg">✕</button>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className={`p-2.5 border-2 border-black rounded-xl text-xs font-bold flex items-center gap-2 ${
            statusMessage.type === 'success' ? 'bg-[#A3E635] text-black' :
            statusMessage.type === 'error' ? 'bg-[#FF4B82] text-white' : 'bg-[#00E5FF] text-black'
          }`}>
            {statusMessage.type === 'success' ? <IconCheckCircle className="w-4 h-4" /> : <IconAlert className="w-4 h-4" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* 1-Click Fast Sync Section */}
        <div className="bg-[#FFFDF6] border-2 border-black p-3 sm:p-4 rounded-xl space-y-3">
          <h4 className="font-black text-xs uppercase text-black flex items-center gap-1.5">
            <IconCopy className="w-3.5 h-3.5" />
            1-Klik Salin Format Google Sheets (Tinggal Paste Ctrl+V)
          </h4>
          
          <p className="text-[11px] font-medium text-slate-600">
            Salin seluruh data yang diformat otomatis dalam baris dan kolom spreadsheet. Buka Google Sheets baru, lalu tekan Paste (Ctrl+V) langsung ke lembar kerja Anda:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleCopyKosManTSV}
              className="comic-button bg-[#FFD000] text-black p-2.5 rounded-xl border-2 border-black font-black text-xs flex items-center justify-center gap-1.5 uppercase"
            >
              {copiedTSV ? <IconCheck className="w-4 h-4 text-green-700" /> : <IconCopy className="w-4 h-4" />}
              {copiedTSV ? 'Tersalin!' : `Salin Inventaris (${items.length} Item)`}
            </button>

            <button
              onClick={handleCopyFinanceTSV}
              className="comic-button bg-[#A3E635] text-black p-2.5 rounded-xl border-2 border-black font-black text-xs flex items-center justify-center gap-1.5 uppercase"
            >
              {copiedFinanceTSV ? <IconCheck className="w-4 h-4 text-green-700" /> : <IconCopy className="w-4 h-4" />}
              {copiedFinanceTSV ? 'Tersalin!' : `Salin Keuangan (${financeRecords.length} Transaksi)`}
            </button>
          </div>
        </div>

        {/* CSV Export Option */}
        <div className="bg-slate-50 border-2 border-black p-3 sm:p-4 rounded-xl space-y-2">
          <h4 className="font-black text-xs uppercase text-black flex items-center gap-1.5">
            <IconDownload className="w-3.5 h-3.5" />
            Unduh Berkas CSV
          </h4>
          <p className="text-[11px] font-medium text-slate-600">
            Unduh format CSV standar yang dapat dibuka di Google Sheets atau Microsoft Excel:
          </p>
          <button
            onClick={handleDownloadCSV}
            className="comic-button bg-white text-black px-3.5 py-1.5 rounded-xl border-2 border-black font-bold text-xs flex items-center gap-1.5"
          >
            <IconDownload className="w-3.5 h-3.5" />
            Unduh CSV Inventaris KosMan
          </button>
        </div>

        {/* Paste from Google Sheets Import */}
        <div className="bg-white border-2 border-black p-3 sm:p-4 rounded-xl space-y-2">
          <h4 className="font-black text-xs uppercase text-black flex items-center gap-1.5">
            <IconUpload className="w-3.5 h-3.5" />
            Impor dari Google Sheets (Paste Data)
          </h4>
          <p className="text-[11px] font-medium text-slate-600">
            Salin beberapa baris dari spreadsheet Anda, lalu tempel di bawah ini untuk memperbarui katalog:
          </p>
          <textarea
            value={pasteInputText}
            onChange={(e) => setPasteInputText(e.target.value)}
            placeholder="Tempel baris dari Google Sheets di sini..."
            rows={3}
            className="w-full p-2 border-2 border-black rounded-xl font-mono text-[11px]"
          />
          <button
            onClick={handleImportPastedTSV}
            className="comic-button bg-[#00E5FF] text-black px-3.5 py-1.5 rounded-xl border-2 border-black font-black text-xs uppercase"
          >
            Proses & Perbarui Inventaris
          </button>
        </div>

      </div>
    </div>
  );
};
