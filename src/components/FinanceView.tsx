import React, { useState, useMemo } from 'react';
import { FinanceRecord, SavingGoal, Budget, KosItem } from '../types/kosman';
import { 
  IconWallet, IconPlus, IconTrash, IconSearch, 
  IconCheck, IconSheet, IconCamera, IconReceipt, IconSparkles 
} from './icons/SvgIcons';
import { autoSyncFinanceToSheets } from '../services/googleSheetsAutoSync';

interface FinanceViewProps {
  records: FinanceRecord[];
  savings: SavingGoal[];
  budgets: Budget[];
  kosItems?: KosItem[];
  onAddRecord: (record: Omit<FinanceRecord, 'id' | 'createdAt'>) => void;
  onDeleteRecord: (id: string) => void;
  onAddSaving: (saving: Omit<SavingGoal, 'id'>) => void;
  onUpdateSaving: (id: string, currentAmount: number) => void;
  onDeleteSaving: (id: string) => void;
  onOpenGoogleSheets?: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  records,
  savings,
  budgets,
  kosItems = [],
  onAddRecord,
  onDeleteRecord,
  onAddSaving,
  onUpdateSaving,
  onDeleteSaving,
  onOpenGoogleSheets,
}) => {
  const [activeTab, setActiveTab] = useState<'transaksi' | 'tabungan' | 'budget'>('transaksi');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSavingModal, setShowSavingModal] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);

  // Form State for Add Transaction
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: 'Makan & Minum',
    note: '',
    account: 'Kas' as 'Kas' | 'Bank' | 'E-Wallet',
    date: new Date().toISOString().split('T')[0]
  });

  // Form State for Add Saving Goal
  const [savingFormData, setSavingFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    location: 'Bank',
    deadline: ''
  });

  // Calculated Stats
  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let kas = 0;
    let bank = 0;
    let ewallet = 0;

    records.forEach(r => {
      const amt = r.amount;
      if (r.type === 'income') {
        totalIncome += amt;
        if (r.account === 'Kas') kas += amt;
        if (r.account === 'Bank') bank += amt;
        if (r.account === 'E-Wallet') ewallet += amt;
      } else {
        totalExpense += amt;
        if (r.account === 'Kas') kas -= amt;
        if (r.account === 'Bank') bank -= amt;
        if (r.account === 'E-Wallet') ewallet -= amt;
      }
    });

    const netCashflow = totalIncome - totalExpense;
    const totalBalance = kas + bank + ewallet;

    return { totalIncome, totalExpense, netCashflow, totalBalance, kas, bank, ewallet };
  }, [records]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records
      .filter(r => {
        const matchesType = filterType === 'all' || r.type === filterType;
        const matchesSearch = 
          r.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.account.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [records, filterType, searchQuery]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) return;

    const newRecData = {
      type: formData.type,
      amount: amt,
      category: formData.category,
      note: formData.note.trim() || (formData.type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
      account: formData.account,
      date: formData.date
    };

    onAddRecord(newRecData);

    // Auto-sync to Google Sheets in real-time
    autoSyncFinanceToSheets({
      id: 'fin-' + Date.now(),
      ...newRecData
    });

    setFormData({
      type: 'expense',
      amount: '',
      category: 'Makan & Minum',
      note: '',
      account: 'Kas',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddModal(false);
  };

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const res = await fetch('/api/gemini/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          const ocr = data.data;
          setFormData({
            type: 'expense',
            amount: ocr.totalAmount ? ocr.totalAmount.toString() : '',
            category: ocr.category || 'Belanja KosMan',
            note: ocr.note || ocr.storeName || 'Struk Belanja AI OCR',
            account: 'Kas',
            date: ocr.date || new Date().toISOString().split('T')[0]
          });
          setShowAddModal(true);
        } else {
          alert('Tidak dapat mengekstrak data dari nota ini.');
        }
        setIsOcrProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memproses gambar nota.');
      setIsOcrProcessing(false);
    }
  };

  const handleSavingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(savingFormData.targetAmount);
    const current = parseFloat(savingFormData.currentAmount) || 0;
    if (isNaN(target) || target <= 0 || !savingFormData.name.trim()) return;

    onAddSaving({
      name: savingFormData.name.trim(),
      targetAmount: target,
      currentAmount: current,
      location: savingFormData.location,
      deadline: savingFormData.deadline || undefined
    });

    setSavingFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      location: 'Bank',
      deadline: ''
    });
    setShowSavingModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 space-y-3">
      
      {/* Top Summary Cards (Fit-Screen & Ultra Compact) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        
        <div className="bg-[#FFD000] border border-black p-2.5 rounded-lg shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase text-black block">Total Saldo Bersih</span>
          <div className="text-sm sm:text-lg font-black font-mono text-black truncate mt-0.5">
            Rp {stats.totalBalance.toLocaleString('id-ID')}
          </div>
          <span className="text-[9px] font-bold text-slate-800 block mt-0.5 truncate">
            Kas: {stats.kas.toLocaleString('id-ID')} · Bank: {stats.bank.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="bg-[#A3E635] border border-black p-2.5 rounded-lg shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase text-black block">Pemasukan</span>
          <div className="text-sm sm:text-lg font-black font-mono text-black truncate mt-0.5">
            +Rp {stats.totalIncome.toLocaleString('id-ID')}
          </div>
          <span className="text-[9px] font-bold text-slate-800 block mt-0.5">
            {records.filter(r => r.type === 'income').length} Transaksi Masuk
          </span>
        </div>

        <div className="bg-[#FF4B82] text-white border border-black p-2.5 rounded-lg shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase text-white block">Pengeluaran</span>
          <div className="text-sm sm:text-lg font-black font-mono text-white truncate mt-0.5">
            -Rp {stats.totalExpense.toLocaleString('id-ID')}
          </div>
          <span className="text-[9px] font-bold text-white/90 block mt-0.5">
            {records.filter(r => r.type === 'expense').length} Transaksi Keluar
          </span>
        </div>

        <div className="bg-[#00E5FF] border border-black p-2.5 rounded-lg shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase text-black block">Cashflow Bersih</span>
          <div className={`text-sm sm:text-lg font-black font-mono truncate mt-0.5 ${stats.netCashflow >= 0 ? 'text-black' : 'text-red-700'}`}>
            Rp {stats.netCashflow.toLocaleString('id-ID')}
          </div>
          <span className="text-[9px] font-bold text-slate-800 block mt-0.5">
            Surplus & Alokasi
          </span>
        </div>

      </div>

      {/* Toolbar & Action Controls */}
      <div className="bg-white border border-black p-2.5 rounded-xl shadow-[2px_2px_0px_#000] space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          
          {/* Sub Tabs */}
          <div className="flex items-center gap-1 bg-[#FFFDF6] border border-black p-0.5 rounded-lg">
            <button
              onClick={() => setActiveTab('transaksi')}
              className={`px-2 py-1 rounded-md text-[11px] font-black transition-all ${
                activeTab === 'transaksi' ? 'bg-[#FFD000] text-black shadow-[1px_1px_0px_#000]' : 'text-slate-700'
              }`}
            >
              Transaksi ({records.length})
            </button>
            <button
              onClick={() => setActiveTab('tabungan')}
              className={`px-2 py-1 rounded-md text-[11px] font-black transition-all ${
                activeTab === 'tabungan' ? 'bg-[#00E5FF] text-black shadow-[1px_1px_0px_#000]' : 'text-slate-700'
              }`}
            >
              Tabungan ({savings.length})
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-2 py-1 rounded-md text-[11px] font-black transition-all ${
                activeTab === 'budget' ? 'bg-[#A3E635] text-black shadow-[1px_1px_0px_#000]' : 'text-slate-700'
              }`}
            >
              Budget ({budgets.length})
            </button>
          </div>

          {/* Actions: Scan Struk AI OCR & Manual Add */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <label className={`cursor-pointer bg-[#00E5FF] hover:bg-cyan-400 text-black px-2.5 py-1 rounded-lg border border-black font-black text-[11px] uppercase flex items-center justify-center gap-1 shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${isOcrProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
              <IconCamera className="w-3.5 h-3.5" />
              <span>{isOcrProcessing ? 'Memproses...' : 'Scan Nota (AI OCR)'}</span>
              <input type="file" accept="image/*" capture="environment" onChange={handleScanReceipt} className="hidden" />
            </label>

            {onOpenGoogleSheets && (
              <button
                type="button"
                onClick={onOpenGoogleSheets}
                className="bg-[#10B981] text-white px-2.5 py-1 rounded-lg border border-black font-black text-[11px] uppercase flex items-center justify-center gap-1 shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
              >
                <IconSheet className="w-3.5 h-3.5" />
                <span>Google Sheets</span>
              </button>
            )}

            {activeTab === 'transaksi' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#FF4B82] text-white px-3 py-1 rounded-lg border border-black font-black text-[11px] uppercase flex items-center justify-center gap-1 shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
              >
                <IconPlus className="w-3.5 h-3.5" />
                Tambah
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search */}
        {activeTab === 'transaksi' && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
            <div className="relative flex-1">
              <IconSearch className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi..."
                className="w-full pl-8 pr-3 py-1 border border-black rounded-lg text-xs font-bold bg-[#FFFDF6]"
              />
            </div>

            <div className="flex items-center gap-1 text-[10px] font-bold">
              {(['all', 'income', 'expense'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2 py-0.5 rounded border border-black capitalize ${
                    filterType === t ? 'bg-black text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {t === 'all' ? 'Semua' : t === 'income' ? 'Masuk' : 'Keluar'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: Transaksi List */}
      {activeTab === 'transaksi' && (
        <div className="space-y-2">
          {filteredRecords.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-2">
              <div className="w-10 h-10 bg-slate-100 border border-black rounded-full flex items-center justify-center mx-auto text-slate-700">
                <IconWallet className="w-5 h-5" />
              </div>
              <h4 className="font-black text-xs text-black">Belum Ada Transaksi Keuangan</h4>
              <p className="text-[10px] font-bold text-slate-500">
                Mulai catat pengeluaran harian atau scan foto nota struk belanja dengan Gemini AI.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredRecords.map(r => (
                <div 
                  key={r.id} 
                  className={`bg-white border border-black p-2.5 rounded-lg flex items-center justify-between gap-2 shadow-[1.5px_1.5px_0px_#000] ${
                    r.type === 'income' ? 'border-l-4 border-l-[#A3E635]' : 'border-l-4 border-l-[#FF4B82]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-md border border-black flex items-center justify-center shrink-0 text-xs font-black ${
                      r.type === 'income' ? 'bg-[#A3E635] text-black' : 'bg-[#FF4B82] text-white'
                    }`}>
                      {r.type === 'income' ? '+' : '-'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-black truncate">{r.note}</span>
                        <span className="bg-[#FFFDF6] border border-black text-[9px] font-bold px-1 rounded text-slate-700 shrink-0">
                          {r.category}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block">
                        {r.date} · {r.account}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-mono font-black text-xs sm:text-sm ${
                      r.type === 'income' ? 'text-green-700' : 'text-red-600'
                    }`}>
                      {r.type === 'income' ? '+' : '-'}Rp {r.amount.toLocaleString('id-ID')}
                    </span>
                    <button
                      onClick={() => onDeleteRecord(r.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Hapus Transaksi"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Tabungan */}
      {activeTab === 'tabungan' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-white border border-black p-3 rounded-lg shadow-[2px_2px_0px_#000]">
            <div>
              <h3 className="font-black text-xs text-black uppercase">Target Tabungan Impian</h3>
              <p className="text-[10px] font-bold text-slate-500">Sisihkan kiriman untuk tabungan darurat & gadget</p>
            </div>
            <button
              onClick={() => setShowSavingModal(true)}
              className="bg-[#00E5FF] text-black px-2.5 py-1 border border-black rounded-lg font-black text-[11px] uppercase shadow-[1.5px_1.5px_0px_#000]"
            >
              + Target Baru
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {savings.map(goal => {
              const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div key={goal.id} className="bg-white border border-black rounded-lg p-3 space-y-2 shadow-[2px_2px_0px_#000]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-xs text-black">{goal.name}</h4>
                      <span className="text-[9px] font-bold text-slate-500 font-mono">{goal.location}</span>
                    </div>
                    <button onClick={() => onDeleteSaving(goal.id)} className="text-slate-400 hover:text-red-600">
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono font-bold">
                      <span>Rp {goal.currentAmount.toLocaleString('id-ID')}</span>
                      <span className="text-slate-500">Rp {goal.targetAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="w-full bg-slate-100 border border-black h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#A3E635] h-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Budget */}
      {activeTab === 'budget' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {budgets.map(b => (
            <div key={b.id} className="bg-white border border-black rounded-lg p-3 shadow-[2px_2px_0px_#000] space-y-1">
              <span className="text-[9px] font-black uppercase bg-[#FFFDF6] border border-black px-1.5 py-0.2 rounded text-black">
                {b.period}
              </span>
              <h4 className="font-black text-xs text-black uppercase">{b.category}</h4>
              <div className="text-sm font-black font-mono text-[#FF4B82]">
                Rp {b.amount.toLocaleString('id-ID')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Transaction Modal (Fit-Screen Compact) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3">
          <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[5px_5px_0px_#000] max-w-sm w-full space-y-3 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-black pb-2">
              <h3 className="font-black text-sm uppercase text-black">CATAT TRANSAKSI KEUANGAN</h3>
              <button onClick={() => setShowAddModal(false)} className="font-bold text-xs">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-2.5 text-xs font-bold">
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`py-1.5 rounded-lg border border-black font-black uppercase text-xs ${
                    formData.type === 'expense' ? 'bg-[#FF4B82] text-white shadow-[1.5px_1.5px_0px_#000]' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  - Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`py-1.5 rounded-lg border border-black font-black uppercase text-xs ${
                    formData.type === 'income' ? 'bg-[#A3E635] text-black shadow-[1.5px_1.5px_0px_#000]' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  + Pemasukan
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 uppercase text-[10px]">Nominal (IDR) *</label>
                  <div className="flex items-center gap-1">
                    {[10000, 20000, 50000, 100000].map(addVal => (
                      <button
                        key={addVal}
                        type="button"
                        onClick={() => {
                          const cur = parseFloat(formData.amount) || 0;
                          setFormData({ ...formData, amount: (cur + addVal).toString() });
                        }}
                        className="text-[9px] font-bold bg-[#FFD000] border border-black px-1.5 py-0.2 rounded"
                      >
                        +{addVal / 1000}k
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  step="500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="50000"
                  className="w-full px-2.5 py-1.5 border border-black rounded-lg font-mono text-sm font-black"
                />
              </div>

              {formData.type === 'expense' && kosItems.length > 0 && (
                <div className="p-2 bg-[#00E5FF]/20 border border-black rounded-lg space-y-1 text-[10px]">
                  <span className="font-black text-black">📦 Auto-Sync Barang KosMan:</span>
                  <select
                    onChange={(e) => {
                      const selected = kosItems.find(item => item.id === e.target.value);
                      if (selected) {
                        setFormData({
                          ...formData,
                          category: 'Belanja KosMan',
                          note: selected.name,
                          amount: selected.price ? selected.price.toString() : formData.amount
                        });
                      }
                    }}
                    defaultValue=""
                    className="w-full px-2 py-1 border border-black rounded font-bold text-[10px] bg-white cursor-pointer"
                  >
                    <option value="" disabled>-- Pilih Item Kosan --</option>
                    {kosItems.slice(0, 40).map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.category}) — Rp {item.price.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 uppercase text-[10px] mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-2 py-1.5 border border-black rounded-lg font-bold bg-white text-xs"
                  >
                    <option value="Makan & Minum">Makan & Minum</option>
                    <option value="Belanja KosMan">Belanja KosMan</option>
                    <option value="Sewa Kos">Sewa Kos</option>
                    <option value="Listrik & Utilitas">Listrik & Utilitas</option>
                    <option value="Transportasi">Transportasi</option>
                    <option value="Kebutuhan Pribadi">Kebutuhan Pribadi</option>
                    <option value="Gaji / Kiriman">Gaji / Kiriman</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 uppercase text-[10px] mb-1">Akun Pembayaran</label>
                  <select
                    value={formData.account}
                    onChange={(e) => setFormData({ ...formData, account: e.target.value as any })}
                    className="w-full px-2 py-1.5 border border-black rounded-lg font-bold bg-white text-xs"
                  >
                    <option value="Kas">Kas (Tunai)</option>
                    <option value="Bank">Bank (Transfer)</option>
                    <option value="E-Wallet">E-Wallet (GoPay/Dana)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 uppercase text-[10px] mb-1">Catatan Keterangan</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Keterangan transaksi..."
                  className="w-full px-2.5 py-1.5 border border-black rounded-lg font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 uppercase text-[10px] mb-1">Tanggal</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-black rounded-lg font-bold text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1 border border-black rounded-lg font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-[#FFD000] text-black border border-black rounded-lg font-black text-xs uppercase shadow-[1.5px_1.5px_0px_#000]"
                >
                  Simpan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
