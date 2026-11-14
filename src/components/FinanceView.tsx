import React, { useState, useMemo, useEffect } from 'react';
import {
  FinanceRecord,
  SavingGoal,
  KosItem,
  BudgetPos,
  BudgetConfig,
  DailyIncomeEntry,
} from '../types/kosman';
import {
  IconWallet,
  IconPlus,
  IconTrash,
  IconSearch,
  IconSheet,
  IconCamera,
} from './icons/SvgIcons';
import {
  InlineDropdown,
  InlineConfirmBar,
  InlineNotice,
  InlineScannerPanel,
  PopupModal,
  OcrExtractedItem,
  ScannedStockItem,
} from './InlineUI';

interface FinanceViewProps {
  records: FinanceRecord[];
  savings: SavingGoal[];
  kosItems?: KosItem[];
  budgetPos: BudgetPos[];
  budgetConfig: BudgetConfig;
  dailyIncomes: DailyIncomeEntry[];
  initialTab?: 'transaksi' | 'budget' | 'tabungan';
  onAddRecord: (record: Omit<FinanceRecord, 'id' | 'createdAt'>) => void;
  onDeleteRecord: (id: string) => void;
  onAddSaving: (saving: Omit<SavingGoal, 'id'>) => void;
  onUpdateSaving: (id: string, currentAmount: number) => void;
  onDeleteSaving: (id: string) => void;
  onUpdateBudgetPos: (newPos: BudgetPos[]) => void;
  onUpdateBudgetConfig: (newConfig: BudgetConfig) => void;
  onAddDailyIncome: (
    entry: Omit<DailyIncomeEntry, 'id' | 'dayName'>,
    account: 'Kas' | 'Bank' | 'E-Wallet'
  ) => void;
  onDeleteDailyIncome: (id: string) => void;
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
  onOpenGoogleSheets?: () => void;
}

const getStartOfIsoWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay() || 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (day - 1));
  return date;
};

export const FinanceView: React.FC<FinanceViewProps> = ({
  records,
  savings,
  kosItems = [],
  budgetPos,
  budgetConfig,
  dailyIncomes,
  initialTab = 'transaksi',
  onAddRecord,
  onDeleteRecord,
  onAddSaving,
  onUpdateSaving,
  onDeleteSaving,
  onUpdateBudgetPos,
  onUpdateBudgetConfig,
  onAddDailyIncome,
  onDeleteDailyIncome,
  onApplyNotaResult,
  onApplyStockScanResult,
  onOpenGoogleSheets,
}) => {
  const [activeTab, setActiveTab] = useState<'transaksi' | 'budget' | 'tabungan'>(initialTab);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Inline Expandable Panels (Zero pop-up modals)
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showSavingForm, setShowSavingForm] = useState(false);
  const [deleteRecConfirmId, setDeleteRecConfirmId] = useState<string | null>(null);
  const [deleteSaveConfirmId, setDeleteSaveConfirmId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(
    null
  );

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Add Transaction Form State
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: 'Makan & Minum',
    note: '',
    account: 'Kas' as 'Kas' | 'Bank' | 'E-Wallet',
    date: new Date().toISOString().split('T')[0],
  });

  // Daily Income Simulation State
  const [incomeSimForm, setIncomeSimForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    note: '',
    account: 'Bank' as 'Kas' | 'Bank' | 'E-Wallet',
  });

  // Saving Goal Form State
  const [savingFormData, setSavingFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    location: 'Bank',
  });

  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let kas = 0;
    let bank = 0;
    let ewallet = 0;

    records.forEach((r) => {
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

    return {
      totalIncome,
      totalExpense,
      totalBalance: kas + bank + ewallet,
      kas,
      bank,
      ewallet,
    };
  }, [records]);

  // Simplified Ratio Budgeting Math (Bulanan or Mingguan)
  const budgetSummary = useMemo(() => {
    const now = new Date();
    const weekStartStr = getStartOfIsoWeek(now).toISOString().split('T')[0];
    const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const periodStartStr = budgetConfig.periodType === 'monthly' ? monthStartStr : weekStartStr;
    const periodExpenses = records.filter(
      (r) => r.type === 'expense' && r.date >= periodStartStr
    );

    const totalPercent = budgetPos.reduce((acc, p) => acc + p.allocationPercent, 0);

    const rows = budgetPos.map((pos) => {
      const allocatedAmount = Math.round(budgetConfig.incomeAmount * (pos.allocationPercent / 100));
      const spent = periodExpenses
        .filter((exp) =>
          pos.linkedCategories.some(
            (cat) =>
              exp.category.toLowerCase().includes(cat.toLowerCase()) ||
              (exp.subCategory || '').toLowerCase().includes(cat.toLowerCase())
          )
        )
        .reduce((acc, exp) => acc + exp.amount, 0);

      const remaining = allocatedAmount - spent;
      const pctUsed = allocatedAmount > 0 ? Math.min(100, Math.round((spent / allocatedAmount) * 100)) : 0;

      return { ...pos, allocatedAmount, spent, remaining, pctUsed };
    });

    const totalSpent = periodExpenses.reduce((acc, r) => acc + r.amount, 0);
    const totalRemaining = budgetConfig.incomeAmount - totalSpent;
    const daysLeft = budgetConfig.periodType === 'monthly' ? 30 - now.getDate() + 1 : 8 - (now.getDay() || 7);
    const safeDaily = Math.max(0, Math.round(totalRemaining / Math.max(1, daysLeft)));

    return { rows, totalPercent, totalSpent, totalRemaining, safeDaily };
  }, [records, budgetPos, budgetConfig]);

  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
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

    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onAddRecord({
      type: formData.type,
      amount: amt,
      category: formData.category,
      note: formData.note.trim() || (formData.type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
      account: formData.account,
      date: formData.date,
      time: hhmm,
      source: 'app',
    });

    setFormData({
      type: 'expense',
      amount: '',
      category: 'Makan & Minum',
      note: '',
      account: 'Kas',
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddForm(false);
    setNotice({ type: 'success', text: 'Transaksi dicatat & disinkronkan ke Google Spreadsheet.' });
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2.5 sm:py-4 space-y-3">
      {/* Compact Financial Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-[#FFD000] border-2 border-black p-2.5 rounded-xl shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase text-black block">Total Saldo Bersih</span>
          <span className="font-mono font-black text-base sm:text-lg text-black tabular-nums">
            Rp {stats.totalBalance.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="bg-[#A3E635] border-2 border-black p-2.5 rounded-xl shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase text-black block">Total Pemasukan</span>
          <span className="font-mono font-black text-base sm:text-lg text-black tabular-nums">
            +Rp {stats.totalIncome.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="bg-[#FF4B82] text-white border-2 border-black p-2.5 rounded-xl shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase block">Total Pengeluaran</span>
          <span className="font-mono font-black text-base sm:text-lg tabular-nums">
            -Rp {stats.totalExpense.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="bg-white border-2 border-black p-2.5 rounded-xl shadow-[2px_2px_0px_#000] text-[10px] font-bold space-y-0.5">
          <div className="flex justify-between">
            <span>Kas:</span>
            <span className="font-mono tabular-nums">Rp {stats.kas.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Bank:</span>
            <span className="font-mono tabular-nums">Rp {stats.bank.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>E-Wallet:</span>
            <span className="font-mono tabular-nums">Rp {stats.ewallet.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Top Action & Tabs Bar */}
      <div className="bg-white border-2 border-black p-2.5 rounded-xl shadow-[2px_2px_0px_#000] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('transaksi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border border-black whitespace-nowrap ${
              activeTab === 'transaksi' ? 'bg-[#FFD000] text-black' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Transaksi ({records.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('budget')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border border-black whitespace-nowrap ${
              activeTab === 'budget' ? 'bg-[#00E5FF] text-black' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Budget & Rasio
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tabungan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border border-black whitespace-nowrap ${
              activeTab === 'tabungan' ? 'bg-[#A3E635] text-black' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Target Tabungan ({savings.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowScanner((v) => !v)}
            className={`comic-button px-2.5 py-1.5 rounded-lg border border-black font-black text-[11px] uppercase flex items-center gap-1 ${
              showScanner ? 'bg-black text-[#00E5FF]' : 'bg-[#00E5FF] text-black'
            }`}
          >
            <IconCamera className="w-3.5 h-3.5" />
            <span>Scan Nota / Stok</span>
          </button>

          {onOpenGoogleSheets && (
            <button
              type="button"
              onClick={onOpenGoogleSheets}
              className="bg-[#A3E635] text-black px-2.5 py-1.5 rounded-lg border border-black font-black text-[11px] uppercase flex items-center gap-1"
            >
              <IconSheet className="w-3.5 h-3.5" />
              <span>Set Sheet</span>
            </button>
          )}
        </div>
      </div>

      {notice && (
        <InlineNotice type={notice.type} message={notice.text} onClose={() => setNotice(null)} />
      )}

      {/* Unified AI Scanner directly inside Keuangan */}
      {showScanner && (
        <InlineScannerPanel
          defaultMode="nota"
          kosItems={kosItems}
          onApplyNotaResult={onApplyNotaResult}
          onApplyStockScanResult={onApplyStockScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* ==================== TAB 1: TRANSAKSI ==================== */}
      {activeTab === 'transaksi' && (
        <div className="space-y-3">
          <div className="bg-white border-2 border-black p-3 rounded-xl shadow-[2px_2px_0px_#000] space-y-2.5">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <IconSearch className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari transaksi, kategori, atau akun..."
                  className="w-full pl-8 pr-3 py-1.5 border-2 border-black rounded-lg text-xs font-bold bg-[#FFFDF6]"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm((v) => !v)}
                className="comic-button bg-[#FFD000] text-black px-3.5 py-1.5 rounded-lg border border-black font-black text-xs uppercase flex items-center justify-center gap-1 shrink-0"
              >
                <IconPlus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Tutup Form' : 'Catat Transaksi'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {(['all', 'income', 'expense'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded border border-black text-[11px] font-black uppercase ${
                    filterType === t ? 'bg-black text-white' : 'bg-[#FFFDF6] text-black'
                  }`}
                >
                  {t === 'all' ? 'Semua' : t === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </button>
              ))}
            </div>
          </div>

          {/* Pop-Up Add Transaction Form */}
          <PopupModal
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            title="Catat Transaksi Keuangan Baru"
            subtitle="Pemasukan atau pengeluaran otomatis disinkronkan ke Google Spreadsheet"
            icon={<IconWallet className="w-4 h-4 text-black" />}
            headerBg="bg-[#FFD000]"
            maxWidthClass="max-w-2xl"
          >
            <form onSubmit={handleFormSubmit} className="space-y-3 pb-12">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense', category: 'Makan & Minum' })}
                  className={`py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase ${
                    formData.type === 'expense' ? 'bg-[#FF4B82] text-white' : 'bg-white text-black'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income', category: 'Gaji / Kiriman' })}
                  className={`py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase ${
                    formData.type === 'income' ? 'bg-[#A3E635] text-black' : 'bg-white text-black'
                  }`}
                >
                  Pemasukan
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                    Nominal (Rp) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="25000"
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-mono font-black bg-white tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-mono bg-white"
                  />
                </div>

                <InlineDropdown
                  label="Kategori"
                  value={formData.category}
                  options={
                    formData.type === 'income'
                      ? ['Gaji / Kiriman', 'Bonus', 'Freelance', 'Lainnya']
                      : [
                          'Makan & Minum',
                          'Belanja KosMan',
                          'Bumbu Dapur',
                          'Kebersihan & Toilet',
                          'Kesehatan',
                          'Kelistrikan & Kos',
                          'Sewa Kos',
                          'Transportasi',
                          'Keinginan',
                          'Tabungan',
                          'Lainnya',
                        ]
                  }
                  onChange={(val) => setFormData({ ...formData, category: val })}
                />

                <InlineDropdown
                  label="Akun"
                  value={formData.account}
                  options={['Kas', 'Bank', 'E-Wallet']}
                  onChange={(val) =>
                    setFormData({ ...formData, account: val as 'Kas' | 'Bank' | 'E-Wallet' })
                  }
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                  Keterangan
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Keterangan singkat transaksi..."
                  className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-bold bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 bg-white border-2 border-black rounded-lg text-xs font-bold text-black"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="comic-button bg-[#A3E635] text-black px-4 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_#000]"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </PopupModal>

          {deleteRecConfirmId && (
            <InlineConfirmBar
              title="Hapus transaksi ini dari catatan Keuangan?"
              confirmLabel="Ya, Hapus"
              onConfirm={() => {
                onDeleteRecord(deleteRecConfirmId);
                setDeleteRecConfirmId(null);
                setNotice({ type: 'info', text: 'Transaksi dihapus & disinkronkan.' });
              }}
              onCancel={() => setDeleteRecConfirmId(null)}
            />
          )}

          {/* Transactions Table */}
          {filteredRecords.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-black rounded-xl p-6 text-center space-y-2">
              <IconWallet className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                Belum ada catatan transaksi. Gunakan tombol "Catat Transaksi" atau "Scan Nota / Stok".
              </p>
            </div>
          ) : (
            <div className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-[3px_3px_0px_#000]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-900 text-white text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Tanggal & Jam</th>
                      <th className="p-2.5">Keterangan & Kategori</th>
                      <th className="p-2.5 hidden sm:table-cell">Akun</th>
                      <th className="p-2.5 text-right">Nominal</th>
                      <th className="p-2.5 text-center w-12">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRecords.map((r) => (
                      <tr key={r.id}>
                        <td className="p-2.5 font-mono text-[10px] text-slate-600 tabular-nums whitespace-nowrap">
                          {r.date} {r.time ? `· ${r.time}` : ''}
                        </td>
                        <td className="p-2.5">
                          <div className="font-black text-black">{r.note}</div>
                          <div className="text-[10px] font-bold text-slate-500">
                            {r.category}
                            {r.source ? ` · via ${r.source}` : ''}
                          </div>
                        </td>
                        <td className="p-2.5 hidden sm:table-cell text-[11px] font-bold text-slate-700">
                          {r.account}
                        </td>
                        <td
                          className={`p-2.5 text-right font-mono font-black tabular-nums whitespace-nowrap ${
                            r.type === 'income' ? 'text-green-700' : 'text-[#FF4B82]'
                          }`}
                        >
                          {r.type === 'income' ? '+' : '-'}Rp {r.amount.toLocaleString('id-ID')}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => setDeleteRecConfirmId(r.id)}
                            className="p-1 text-slate-400 hover:text-red-600"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: BUDGETING SEDERHANA (PERIODE BULAN/MINGGU + RASIO %) ==================== */}
      {activeTab === 'budget' && (
        <div className="space-y-3">
          {/* Simplified Income & Period Control */}
          <div className="bg-white border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_#000] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black pb-2">
              <div>
                <h3 className="font-display font-black text-sm uppercase text-black">
                  Pengaturan Budget & Rasio Pos Sederhana
                </h3>
                <p className="text-[11px] font-bold text-slate-600">
                  Pilih periode terima uang (Bulanan atau Mingguan), masukkan nominal, lalu sesuaikan rasio %.
                </p>
              </div>
              <div className="inline-flex border-2 border-black rounded-lg overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateBudgetConfig({ ...budgetConfig, periodType: 'monthly' })
                  }
                  className={`px-3 py-1 text-xs font-black uppercase ${
                    budgetConfig.periodType === 'monthly'
                      ? 'bg-[#FFD000] text-black'
                      : 'bg-white text-slate-600'
                  }`}
                >
                  Per Bulan
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateBudgetConfig({ ...budgetConfig, periodType: 'weekly' })
                  }
                  className={`px-3 py-1 text-xs font-black uppercase border-l border-black ${
                    budgetConfig.periodType === 'weekly'
                      ? 'bg-[#00E5FF] text-black'
                      : 'bg-white text-slate-600'
                  }`}
                >
                  Per Minggu
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                  Total Uang Masuk / {budgetConfig.periodType === 'monthly' ? 'Bulan' : 'Minggu'} (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={budgetConfig.incomeAmount}
                  onChange={(e) =>
                    onUpdateBudgetConfig({
                      ...budgetConfig,
                      incomeAmount: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className="w-full px-3 py-1.5 border-2 border-black rounded-lg text-sm font-mono font-black bg-[#FFFDF6] tabular-nums"
                />
              </div>

              <div className="bg-[#FFFDF6] border border-black rounded-lg p-2">
                <span className="text-[10px] font-black uppercase text-slate-600 block">
                  Terpakai ({budgetConfig.periodType === 'monthly' ? 'Bulan Ini' : 'Minggu Ini'})
                </span>
                <span className="font-mono font-black text-sm text-[#FF4B82] tabular-nums">
                  Rp {budgetSummary.totalSpent.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="bg-[#A3E635] border border-black rounded-lg p-2">
                <span className="text-[10px] font-black uppercase text-black block">
                  Sisa Aman / Hari
                </span>
                <span className="font-mono font-black text-sm text-black tabular-nums">
                  Rp {budgetSummary.safeDaily.toLocaleString('id-ID')} / hari
                </span>
              </div>
            </div>
          </div>

          {/* Clean Ratio Table */}
          <div className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-[3px_3px_0px_#000]">
            <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between text-[11px] font-black uppercase">
              <span>Alokasi Rasio Pos Pengeluaran</span>
              <span
                className={`px-2 py-0.5 rounded font-mono ${
                  budgetSummary.totalPercent === 100
                    ? 'bg-[#A3E635] text-black'
                    : 'bg-[#FF4B82] text-white'
                }`}
              >
                Total Rasio: {budgetSummary.totalPercent}%
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {budgetSummary.rows.map((row) => (
                <div key={row.id} className="p-3 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-black text-xs text-black">{row.name}</span>
                      <span className="block text-[10px] text-slate-500">
                        {row.linkedCategories.slice(0, 3).join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-black uppercase text-slate-600">
                        Rasio %:
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={row.allocationPercent}
                        onChange={(e) => {
                          const nextPct = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                          const updated = budgetPos.map((p) =>
                            p.id === row.id
                              ? {
                                  ...p,
                                  allocationPercent: nextPct,
                                  weeklyTarget: Math.round(
                                    budgetConfig.incomeAmount *
                                      (budgetConfig.periodType === 'monthly' ? 0.25 : 1) *
                                      (nextPct / 100)
                                  ),
                                }
                              : p
                          );
                          onUpdateBudgetPos(updated);
                        }}
                        className="w-16 px-2 py-1 border border-black rounded text-xs font-mono font-black text-right tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 border border-black rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${row.pctUsed}%`,
                        backgroundColor: row.remaining < 0 ? '#FF4B82' : row.color,
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap justify-between text-[11px] font-mono tabular-nums">
                    <span>
                      Jatah: <strong>Rp {row.allocatedAmount.toLocaleString('id-ID')}</strong>
                    </span>
                    <span>
                      Terpakai: <strong>Rp {row.spent.toLocaleString('id-ID')}</strong>
                    </span>
                    <span className={row.remaining < 0 ? 'text-red-600 font-black' : 'text-green-700 font-black'}>
                      {row.remaining < 0 ? 'OVER ' : 'Sisa: '}Rp{' '}
                      {Math.abs(row.remaining).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Quick Daily Income Log */}
          <div className="bg-white border-2 border-black p-3 rounded-xl space-y-2">
            <h4 className="font-black text-xs uppercase text-black">
              Catat Uang Masuk Harian ({dailyIncomes.length})
            </h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const amt = parseFloat(incomeSimForm.amount);
                if (!amt || amt <= 0) return;
                onAddDailyIncome(
                  {
                    date: incomeSimForm.date,
                    amount: amt,
                    note: incomeSimForm.note.trim() || 'Pemasukan',
                  },
                  incomeSimForm.account
                );
                setIncomeSimForm({ ...incomeSimForm, amount: '', note: '' });
                setNotice({ type: 'success', text: 'Pemasukan harian dicatat & disinkronkan.' });
              }}
              className="grid grid-cols-1 sm:grid-cols-4 gap-2"
            >
              <input
                type="date"
                value={incomeSimForm.date}
                onChange={(e) => setIncomeSimForm({ ...incomeSimForm, date: e.target.value })}
                className="px-2 py-1.5 border border-black rounded-lg text-xs font-mono"
              />
              <input
                type="number"
                required
                value={incomeSimForm.amount}
                onChange={(e) => setIncomeSimForm({ ...incomeSimForm, amount: e.target.value })}
                placeholder="Nominal Rp..."
                className="px-2 py-1.5 border border-black rounded-lg text-xs font-mono font-bold"
              />
              <input
                type="text"
                value={incomeSimForm.note}
                onChange={(e) => setIncomeSimForm({ ...incomeSimForm, note: e.target.value })}
                placeholder="Sumber (Kiriman, Freelance...)"
                className="px-2 py-1.5 border border-black rounded-lg text-xs font-bold"
              />
              <button
                type="submit"
                className="comic-button bg-[#A3E635] text-black px-3 py-1.5 rounded-lg border border-black text-xs font-black uppercase"
              >
                + Tambah Uang Masuk
              </button>
            </form>

            {dailyIncomes.length > 0 && (
              <div className="divide-y divide-slate-200 border-t border-slate-200 pt-1 text-xs">
                {dailyIncomes.slice(0, 6).map((d) => (
                  <div key={d.id} className="py-1.5 flex items-center justify-between gap-2">
                    <span className="font-bold">
                      {d.dayName}, {d.date} · {d.note}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-green-700 tabular-nums">
                        +Rp {d.amount.toLocaleString('id-ID')}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteDailyIncome(d.id)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: TARGET TABUNGAN ==================== */}
      {activeTab === 'tabungan' && (
        <div className="space-y-3">
          <div className="bg-white border-2 border-black p-3 rounded-xl flex items-center justify-between">
            <h3 className="font-display font-black text-sm uppercase text-black">
              Target Tabungan Pribadi
            </h3>
            <button
              type="button"
              onClick={() => setShowSavingForm((v) => !v)}
              className="comic-button bg-[#A3E635] text-black px-3 py-1.5 rounded-lg border border-black text-xs font-black uppercase"
            >
              {showSavingForm ? 'Tutup Form' : '+ Tambah Target'}
            </button>
          </div>

          <PopupModal
            isOpen={showSavingForm}
            onClose={() => setShowSavingForm(false)}
            title="Tambah Target Tabungan Baru"
            subtitle="Tetapkan nominal target & lokasi penyimpanan dana"
            icon={<IconPlus className="w-4 h-4 text-black" />}
            headerBg="bg-[#A3E635]"
            maxWidthClass="max-w-xl"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!savingFormData.name.trim()) return;
                onAddSaving({
                  name: savingFormData.name.trim(),
                  targetAmount: Number(savingFormData.targetAmount) || 100000,
                  currentAmount: Number(savingFormData.currentAmount) || 0,
                  location: savingFormData.location,
                });
                setSavingFormData({ name: '', targetAmount: '', currentAmount: '', location: 'Bank' });
                setShowSavingForm(false);
                setNotice({ type: 'success', text: 'Target tabungan baru ditambahkan.' });
              }}
              className="space-y-2.5 pb-12"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                    Nama Target *
                  </label>
                  <input
                    type="text"
                    required
                    value={savingFormData.name}
                    onChange={(e) => setSavingFormData({ ...savingFormData, name: e.target.value })}
                    placeholder="Dana Darurat, Laptop..."
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-bold bg-white"
                  />
                </div>
                <InlineDropdown
                  label="Simpan Di"
                  value={savingFormData.location}
                  options={['Bank', 'E-Wallet', 'Kas Tunai']}
                  onChange={(val) => setSavingFormData({ ...savingFormData, location: val })}
                />
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                    Target Nominal (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    value={savingFormData.targetAmount}
                    onChange={(e) =>
                      setSavingFormData({ ...savingFormData, targetAmount: e.target.value })
                    }
                    placeholder="500000"
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                    Saldo Awal (Rp)
                  </label>
                  <input
                    type="number"
                    value={savingFormData.currentAmount}
                    onChange={(e) =>
                      setSavingFormData({ ...savingFormData, currentAmount: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-mono bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSavingForm(false)}
                  className="px-3 py-1.5 bg-white border-2 border-black rounded-lg text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="comic-button bg-[#FFD000] text-black px-3.5 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_#000]"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </PopupModal>

          {deleteSaveConfirmId && (
            <InlineConfirmBar
              title="Hapus target tabungan ini?"
              confirmLabel="Ya, Hapus"
              onConfirm={() => {
                onDeleteSaving(deleteSaveConfirmId);
                setDeleteSaveConfirmId(null);
              }}
              onCancel={() => setDeleteSaveConfirmId(null)}
            />
          )}

          {savings.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-black rounded-xl p-6 text-center text-xs font-bold text-slate-600">
              Belum ada target tabungan. Tekan "+ Tambah Target" di atas untuk memulai.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {savings.map((s) => {
                const pct = Math.min(100, Math.round((s.currentAmount / (s.targetAmount || 1)) * 100));
                return (
                  <div
                    key={s.id}
                    className="bg-white border-2 border-black rounded-xl p-3 space-y-2 shadow-[2px_2px_0px_#000]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-xs text-black uppercase">{s.name}</h4>
                        <span className="text-[10px] font-bold text-slate-500">{s.location}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeleteSaveConfirmId(s.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 border border-black rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3E635]" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                      <span>
                        Rp {s.currentAmount.toLocaleString('id-ID')} / Rp{' '}
                        {s.targetAmount.toLocaleString('id-ID')}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateSaving(s.id, s.currentAmount + 50000)}
                        className="px-2 py-0.5 bg-[#FFD000] border border-black rounded text-[10px] font-black"
                      >
                        +50rb
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
