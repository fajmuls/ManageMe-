import React, { useState, useMemo } from 'react';
import { FinanceRecord, SavingGoal, Budget, KosItem } from '../types/kosman';
import { 
  IconWallet, IconPlus, IconTrash, IconSearch, IconArrowRight, 
  IconCheck, IconDownload, IconSheet, IconAlert 
} from './icons/SvgIcons';

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) return;

    onAddRecord({
      type: formData.type,
      amount: amt,
      category: formData.category,
      note: formData.note.trim() || (formData.type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
      account: formData.account,
      date: formData.date
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
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      
      {/* Top Banner / Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Total Saldo */}
        <div className="bg-[#FFD000] border-2 sm:border-3 border-black p-3 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow">
          <span className="text-[10px] sm:text-xs font-black uppercase text-black block">Total Saldo Bersih</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display font-black text-lg sm:text-2xl text-black font-mono truncate">
              Rp {stats.totalBalance.toLocaleString('id-ID')}
            </span>
          </div>
          <span className="text-[9px] sm:text-[11px] font-bold text-slate-800 block mt-1">
            Kas: {stats.kas.toLocaleString('id-ID')} · Bank: {stats.bank.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Total Pemasukan */}
        <div className="bg-[#A3E635] border-2 sm:border-3 border-black p-3 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow">
          <span className="text-[10px] sm:text-xs font-black uppercase text-black block">Total Pemasukan</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display font-black text-lg sm:text-2xl text-black font-mono truncate">
              +Rp {stats.totalIncome.toLocaleString('id-ID')}
            </span>
          </div>
          <span className="text-[9px] sm:text-[11px] font-bold text-slate-800 block mt-1">
            {records.filter(r => r.type === 'income').length} Transaksi Masuk
          </span>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-[#FF4B82] text-white border-2 sm:border-3 border-black p-3 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow">
          <span className="text-[10px] sm:text-xs font-black uppercase block">Total Pengeluaran</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display font-black text-lg sm:text-2xl font-mono truncate">
              -Rp {stats.totalExpense.toLocaleString('id-ID')}
            </span>
          </div>
          <span className="text-[9px] sm:text-[11px] font-bold text-white/90 block mt-1">
            {records.filter(r => r.type === 'expense').length} Transaksi Keluar
          </span>
        </div>

        {/* Net Cashflow */}
        <div className="bg-[#00E5FF] border-2 sm:border-3 border-black p-3 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow">
          <span className="text-[10px] sm:text-xs font-black uppercase text-black block">Net Cashflow</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display font-black text-lg sm:text-2xl text-black font-mono truncate">
              Rp {stats.netCashflow.toLocaleString('id-ID')}
            </span>
          </div>
          <span className="text-[9px] sm:text-[11px] font-bold text-slate-800 block mt-1">
            {stats.netCashflow >= 0 ? 'Surplus Aman' : 'Defisit - Cek Belanja'}
          </span>
        </div>

      </div>

      {/* Tab Switcher & Action Toolbar */}
      <div className="bg-white border-2 sm:border-3 border-black p-3 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow space-y-3">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          
          {/* Sub Tabs */}
          <div className="flex items-center gap-1 bg-[#FFFDF6] border sm:border-2 border-black p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('transaksi')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'transaksi'
                  ? 'bg-[#FFD000] text-black border border-black shadow-[1px_1px_0px_#000]'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              Transaksi ({records.length})
            </button>
            <button
              onClick={() => setActiveTab('tabungan')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tabungan'
                  ? 'bg-[#00E5FF] text-black border border-black shadow-[1px_1px_0px_#000]'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              Tabungan ({savings.length})
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'budget'
                  ? 'bg-[#A3E635] text-black border border-black shadow-[1px_1px_0px_#000]'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              Budget ({budgets.length})
            </button>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2">
            {onOpenGoogleSheets && (
              <button
                type="button"
                onClick={onOpenGoogleSheets}
                className="bg-[#10B981] text-white px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border sm:border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                title="Sinkronkan transaksi ke Google Sheets"
              >
                <IconSheet className="w-3.5 h-3.5" />
                <span>Google Sheets</span>
              </button>
            )}

            {activeTab === 'transaksi' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="comic-button bg-[#FF4B82] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border sm:border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-1.5 comic-shadow-sm w-full sm:w-auto"
              >
                <IconPlus className="w-3.5 h-3.5" />
                Catat Transaksi
              </button>
            )}

            {activeTab === 'tabungan' && (
              <button
                onClick={() => setShowSavingModal(true)}
                className="comic-button bg-[#00E5FF] text-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border sm:border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-1.5 comic-shadow-sm w-full sm:w-auto"
              >
                <IconPlus className="w-3.5 h-3.5" />
                Tambah Target Tabungan
              </button>
            )}
          </div>

        </div>

        {/* Filter Controls for Transaksi */}
        {activeTab === 'transaksi' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="relative flex-1">
              <IconSearch className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi: sewa kos, makan, token..."
                className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-[#FFFDF6] border-2 border-black rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#FFD000]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border-2 border-black transition-all ${
                  filterType === 'all' ? 'bg-[#FFD000] text-black' : 'bg-white text-slate-700'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border-2 border-black transition-all ${
                  filterType === 'income' ? 'bg-[#A3E635] text-black' : 'bg-white text-slate-700'
                }`}
              >
                + Masuk
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border-2 border-black transition-all ${
                  filterType === 'expense' ? 'bg-[#FF4B82] text-white' : 'bg-white text-slate-700'
                }`}
              >
                - Keluar
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Main Tab Content */}
      {activeTab === 'transaksi' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase px-1">
            <span>Daftar Riwayat ({filteredRecords.length} Catatan)</span>
            <span>Urut Terbaru</span>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-8 text-center comic-shadow space-y-2">
              <span className="text-3xl">💸</span>
              <h4 className="font-display font-black text-base text-black uppercase">Belum ada transaksi ditemukan</h4>
              <p className="text-xs font-bold text-slate-600">Klik "Catat Transaksi" untuk menambahkan catatan baru.</p>
            </div>
          ) : (
            <div className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl comic-shadow overflow-hidden">
              <div className="divide-y divide-black">
                {filteredRecords.map(item => {
                  const isIncome = item.type === 'income';
                  return (
                    <div 
                      key={item.id} 
                      className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl border-2 border-black flex items-center justify-center font-black text-sm shrink-0 ${
                          isIncome ? 'bg-[#A3E635] text-black' : 'bg-[#FF4B82] text-white'
                        }`}>
                          {isIncome ? '+' : '-'}
                        </div>

                        <div className="min-w-0">
                          <span className="font-bold text-xs sm:text-sm text-black block truncate">
                            {item.note}
                          </span>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500 font-bold mt-0.5">
                            <span className="bg-[#FFFDF6] border border-black px-1.5 py-0.2 rounded text-[10px] text-slate-800">
                              {item.category}
                            </span>
                            <span>·</span>
                            <span>{item.account}</span>
                            <span>·</span>
                            <span className="font-mono">{item.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <span className={`font-mono font-black text-xs sm:text-base ${
                          isIncome ? 'text-green-700' : 'text-red-600'
                        }`}>
                          {isIncome ? '+' : '-'}Rp {item.amount.toLocaleString('id-ID')}
                        </span>

                        <button
                          onClick={() => onDeleteRecord(item.id)}
                          className="p-1 sm:p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Transaksi"
                        >
                          <IconTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Tabungan Impian */}
      {activeTab === 'tabungan' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savings.map(goal => {
              const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div key={goal.id} className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-4 sm:p-5 comic-shadow space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-display font-black text-base sm:text-lg text-black uppercase">{goal.name}</h4>
                      <span className="text-[10px] font-bold bg-[#FFFDF6] border border-black px-2 py-0.5 rounded text-slate-700">
                        Lokasi: {goal.location} {goal.deadline ? `· Deadline: ${goal.deadline}` : ''}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteSaving(goal.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Hapus Tabungan"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold font-mono">
                      <span>Terkumpul: Rp {goal.currentAmount.toLocaleString('id-ID')}</span>
                      <span className="text-slate-500">Target: Rp {goal.targetAmount.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="w-full bg-slate-100 border-2 border-black h-4 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="bg-[#A3E635] h-full rounded-full transition-all border border-black" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-slate-600">{progress}% Tercapai</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateSaving(goal.id, goal.currentAmount + 50000)}
                          className="px-2 py-0.5 bg-[#FFD000] border border-black rounded text-[10px] font-black uppercase hover:bg-yellow-400"
                        >
                          +50rb
                        </button>
                        <button
                          onClick={() => onUpdateSaving(goal.id, goal.currentAmount + 100000)}
                          className="px-2 py-0.5 bg-[#00E5FF] border border-black rounded text-[10px] font-black uppercase hover:bg-cyan-400"
                        >
                          +100rb
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Budget & Batas Bulanan */}
      {activeTab === 'budget' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {budgets.map(b => (
              <div key={b.id} className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-4 comic-shadow space-y-2">
                <span className="text-[10px] font-black uppercase bg-[#FFFDF6] border border-black px-2 py-0.5 rounded text-black">
                  {b.period}
                </span>
                <h4 className="font-display font-black text-base text-black uppercase">{b.category}</h4>
                <div className="text-lg font-black font-mono text-[#FF4B82]">
                  Rp {b.amount.toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-4 sm:p-6 comic-shadow-xl max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
              <h3 className="font-display font-black text-lg uppercase text-black">
                CATAT TRANSAKSI KEUANGAN
              </h3>
              <button onClick={() => setShowAddModal(false)} className="font-bold text-slate-500 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs font-bold">
              
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`py-2 rounded-xl border-2 border-black font-black uppercase transition-all ${
                    formData.type === 'expense' ? 'bg-[#FF4B82] text-white shadow-[2px_2px_0px_#000]' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  - Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`py-2 rounded-xl border-2 border-black font-black uppercase transition-all ${
                    formData.type === 'income' ? 'bg-[#A3E635] text-black shadow-[2px_2px_0px_#000]' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  + Pemasukan
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 uppercase">Nominal (IDR) *</label>
                  <div className="flex items-center gap-1">
                    {[10000, 20000, 50000, 100000].map(addVal => (
                      <button
                        key={addVal}
                        type="button"
                        onClick={() => {
                          const cur = parseFloat(formData.amount) || 0;
                          setFormData({ ...formData, amount: (cur + addVal).toString() });
                        }}
                        className="text-[10px] font-bold bg-[#FFD000] hover:bg-yellow-400 border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]"
                      >
                        +{addVal / 1000}k
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, amount: '' })}
                      className="text-[10px] font-bold bg-slate-200 hover:bg-slate-300 border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]"
                    >
                      C
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  step="500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Contoh: 50000"
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-mono text-base font-black focus:outline-none focus:ring-2 focus:ring-[#FFD000]"
                />
              </div>

              {/* KosMan Item Auto-Sync Shortcut (If Expense) */}
              {formData.type === 'expense' && kosItems.length > 0 && (
                <div className="p-2.5 bg-[#00E5FF]/20 border-2 border-black rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-black uppercase flex items-center gap-1">
                      <span>📦 Pilih Item KosMan (Auto-Sync Stok)</span>
                    </label>
                    <span className="text-[9px] font-bold bg-black text-white px-1.5 py-0.2 rounded">
                      Sync Aktif
                    </span>
                  </div>
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
                    className="w-full px-2 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white cursor-pointer"
                  >
                    <option value="" disabled>-- Pilih Barang Kosan untuk Sinkronisasi Otomatis --</option>
                    {kosItems.slice(0, 40).map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.category}) — Rp {item.price.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] font-bold text-slate-700">
                    Otomatis menambah +1 stok dan akumulasi pengeluaran di KosMan saat disimpan.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-2.5 py-2 border-2 border-black rounded-xl font-bold bg-white text-xs"
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
                  <label className="block text-slate-700 uppercase mb-1">Akun Pembayaran</label>
                  <select
                    value={formData.account}
                    onChange={(e) => setFormData({ ...formData, account: e.target.value as any })}
                    className="w-full px-2.5 py-2 border-2 border-black rounded-xl font-bold bg-white text-xs"
                  >
                    <option value="Kas">Kas (Tunai)</option>
                    <option value="Bank">Bank (Transfer)</option>
                    <option value="E-Wallet">E-Wallet (GoPay/OVO/Dana)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 uppercase mb-1">Catatan Keterangan</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Misal: Beli makan siang, galon, token listrik"
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 uppercase mb-1">Tanggal</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border-2 border-black rounded-xl font-bold text-xs hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="comic-button bg-[#FFD000] text-black px-4 py-1.5 border-2 border-black rounded-xl font-black text-xs uppercase"
                >
                  Simpan Transaksi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Add Saving Goal Modal */}
      {showSavingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-4 sm:p-6 comic-shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
              <h3 className="font-display font-black text-lg uppercase text-black">
                TARGET TABUNGAN IMPIAN
              </h3>
              <button onClick={() => setShowSavingModal(false)} className="font-bold text-slate-500 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleSavingSubmit} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 uppercase mb-1">Nama Tujuan Tabungan *</label>
                <input
                  type="text"
                  required
                  value={savingFormData.name}
                  onChange={(e) => setSavingFormData({ ...savingFormData, name: e.target.value })}
                  placeholder="Misal: Dana Darurat, HP Baru, Servis Motor"
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Target Nominal (IDR) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={savingFormData.targetAmount}
                    onChange={(e) => setSavingFormData({ ...savingFormData, targetAmount: e.target.value })}
                    placeholder="Contoh: 3000000"
                    className="w-full px-3 py-2 border-2 border-black rounded-xl font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Saldo Awal (IDR)</label>
                  <input
                    type="number"
                    min="0"
                    value={savingFormData.currentAmount}
                    onChange={(e) => setSavingFormData({ ...savingFormData, currentAmount: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border-2 border-black rounded-xl font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Tempat Simpan</label>
                  <input
                    type="text"
                    value={savingFormData.location}
                    onChange={(e) => setSavingFormData({ ...savingFormData, location: e.target.value })}
                    placeholder="Bank / Dompet / Celengan"
                    className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Target Tanggal</label>
                  <input
                    type="date"
                    value={savingFormData.deadline}
                    onChange={(e) => setSavingFormData({ ...savingFormData, deadline: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSavingModal(false)}
                  className="px-3 py-1.5 border-2 border-black rounded-xl font-bold text-xs hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="comic-button bg-[#00E5FF] text-black px-4 py-1.5 border-2 border-black rounded-xl font-black text-xs uppercase"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
