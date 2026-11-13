import React, { useState, useMemo, useEffect } from 'react';
import { FinanceRecord, SavingGoal, Budget, KosItem, BudgetPos, DailyIncomeEntry } from '../types/kosman';
import { 
  IconWallet, IconPlus, IconTrash, IconSearch, 
  IconCheck, IconSheet, IconCamera, IconReceipt, IconSparkles, IconShoppingBag
} from './icons/SvgIcons';
import { autoSyncFinanceToSheets } from '../services/googleSheetsAutoSync';

export interface OcrExtractedItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  suggestedCategory?: string;
}

interface FinanceViewProps {
  records: FinanceRecord[];
  savings: SavingGoal[];
  budgets: Budget[];
  kosItems?: KosItem[];
  budgetPos: BudgetPos[];
  dailyIncomes: DailyIncomeEntry[];
  initialTab?: 'transaksi' | 'simulasi' | 'tabungan' | 'budget';
  onAddRecord: (record: Omit<FinanceRecord, 'id' | 'createdAt'>) => void;
  onDeleteRecord: (id: string) => void;
  onAddSaving: (saving: Omit<SavingGoal, 'id'>) => void;
  onUpdateSaving: (id: string, currentAmount: number) => void;
  onDeleteSaving: (id: string) => void;
  onUpdateBudgetPos: (newPos: BudgetPos[]) => void;
  onAddDailyIncome: (entry: Omit<DailyIncomeEntry, 'id' | 'dayName'>, account: 'Kas' | 'Bank' | 'E-Wallet') => void;
  onDeleteDailyIncome: (id: string) => void;
  onImportOcrItems?: (items: OcrExtractedItem[]) => void;
  onOpenGoogleSheets?: () => void;
}

const getStartOfIsoWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay() || 7; // Sun = 7
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (day - 1));
  return date;
};

const getRemainingDaysInWeek = (d: Date) => {
  const day = d.getDay() || 7; // Mon=1 .. Sun=7
  return Math.max(1, 8 - day);
};

export const FinanceView: React.FC<FinanceViewProps> = ({
  records,
  savings,
  budgets,
  kosItems = [],
  budgetPos,
  dailyIncomes,
  initialTab = 'transaksi',
  onAddRecord,
  onDeleteRecord,
  onAddSaving,
  onUpdateSaving,
  onDeleteSaving,
  onUpdateBudgetPos,
  onAddDailyIncome,
  onDeleteDailyIncome,
  onImportOcrItems,
  onOpenGoogleSheets,
}) => {
  const [activeTab, setActiveTab] = useState<'transaksi' | 'simulasi' | 'tabungan' | 'budget'>(initialTab);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSavingModal, setShowSavingModal] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [pendingOcrItems, setPendingOcrItems] = useState<OcrExtractedItem[]>([]);
  const [importOcrToKos, setImportOcrToKos] = useState(true);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Form State for Add Transaction
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: 'Makan & Minum',
    note: '',
    account: 'Kas' as 'Kas' | 'Bank' | 'E-Wallet',
    date: new Date().toISOString().split('T')[0]
  });

  // Form State for Daily Income Simulation
  const [incomeSimForm, setIncomeSimForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    note: '',
    account: 'Bank' as 'Kas' | 'Bank' | 'E-Wallet',
  });

  // Form State for Add Saving Goal
  const [savingFormData, setSavingFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    location: 'Bank',
    deadline: ''
  });

  // Calculated Overall Stats
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

    return {
      totalIncome,
      totalExpense,
      netCashflow: totalIncome - totalExpense,
      totalBalance: kas + bank + ewallet,
      kas,
      bank,
      ewallet,
    };
  }, [records]);

  // Weekly Simulation & Pos Calculation
  const weeklySim = useMemo(() => {
    const now = new Date();
    const weekStart = getStartOfIsoWeek(now);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const weekRecords = records.filter(r => r.date >= weekStartStr);
    const weekExpenses = weekRecords.filter(r => r.type === 'expense');
    const weekIncomesFromRecords = weekRecords
      .filter(r => r.type === 'income')
      .reduce((acc, r) => acc + r.amount, 0);

    const weekDailyIncomeEntries = dailyIncomes.filter(d => d.date >= weekStartStr);
    const weekIncomesFromSim = weekDailyIncomeEntries.reduce((acc, d) => acc + d.amount, 0);
    const totalWeekIncome = Math.max(weekIncomesFromRecords, weekIncomesFromSim);

    const totalWeekExpense = weekExpenses.reduce((acc, r) => acc + r.amount, 0);
    const totalWeeklyTarget = budgetPos.reduce((acc, p) => acc + p.weeklyTarget, 0);
    const remainingBudget = Math.max(0, totalWeeklyTarget - totalWeekExpense);
    const remainingDays = getRemainingDaysInWeek(now);
    const safeDailySpend = Math.round(remainingBudget / remainingDays);

    const posBreakdown = budgetPos.map(pos => {
      const spent = weekExpenses
        .filter(exp =>
          pos.linkedCategories.some(cat =>
            exp.category.toLowerCase().includes(cat.toLowerCase()) ||
            (exp.subCategory || '').toLowerCase().includes(cat.toLowerCase())
          )
        )
        .reduce((acc, exp) => acc + exp.amount, 0);
      const remaining = pos.weeklyTarget - spent;
      const pct = pos.weeklyTarget > 0 ? Math.min(100, Math.round((spent / pos.weeklyTarget) * 100)) : 0;
      return { ...pos, spent, remaining, pct };
    });

    const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const byDay = dayOrder.map(dayName => {
      const sum = dailyIncomes
        .filter(d => d.dayName === dayName)
        .reduce((acc, d) => acc + d.amount, 0);
      return { dayName, sum };
    });

    const savingPos = budgetPos.find(p => p.id === 'pos-tabungan' || p.name.toLowerCase().includes('tabung'));
    const savingTargetWeek = savingPos ? savingPos.weeklyTarget : 0;

    return {
      weekStartStr,
      totalWeekIncome,
      totalWeekExpense,
      totalWeeklyTarget,
      remainingBudget,
      remainingDays,
      safeDailySpend,
      savingTargetWeek,
      posBreakdown,
      byDay,
    };
  }, [records, dailyIncomes, budgetPos]);

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

    const newRecData: Omit<FinanceRecord, 'id' | 'createdAt'> = {
      type: formData.type,
      amount: amt,
      category: formData.category,
      note: formData.note.trim() || (formData.type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
      account: formData.account,
      date: formData.date,
      source: pendingOcrItems.length > 0 ? 'ocr' : 'app',
    };

    onAddRecord(newRecData);

    if (pendingOcrItems.length > 0 && importOcrToKos && onImportOcrItems) {
      onImportOcrItems(pendingOcrItems);
    }

    setPendingOcrItems([]);
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
    setOcrError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = event.target?.result as string;
          const res = await fetch('/api/gemini/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
          });
          const data = await res.json();
          if (data.success && data.data) {
            const ocr = data.data;
            const extractedItems: OcrExtractedItem[] = Array.isArray(ocr.items) ? ocr.items : [];
            setPendingOcrItems(extractedItems);
            setFormData({
              type: 'expense',
              amount: ocr.totalAmount ? String(ocr.totalAmount) : '',
              category: ocr.category || 'Belanja KosMan',
              note: ocr.note || ocr.storeName || 'Struk Belanja AI OCR',
              account: 'Kas',
              date: ocr.date || new Date().toISOString().split('T')[0]
            });
            setShowAddModal(true);
          } else {
            setOcrError(data.error || 'Tidak dapat mengekstrak data dari nota ini.');
          }
        } catch (innerErr: any) {
          setOcrError(innerErr?.message || 'Gagal menghubungi server OCR.');
        } finally {
          setIsOcrProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setOcrError('Terjadi kesalahan saat membaca file gambar.');
      setIsOcrProcessing(false);
    }
    e.target.value = '';
  };

  const handleDailyIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(incomeSimForm.amount);
    if (isNaN(amt) || amt <= 0) return;

    onAddDailyIncome(
      {
        date: incomeSimForm.date,
        amount: amt,
        note: incomeSimForm.note.trim() || 'Pemasukan Harian',
      },
      incomeSimForm.account
    );

    setIncomeSimForm({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      note: '',
      account: 'Bank',
    });
  };

  const handlePosChange = (id: string, field: 'weeklyTarget' | 'allocationPercent', val: number) => {
    const updated = budgetPos.map(p => (p.id === id ? { ...p, [field]: Math.max(0, val) } : p));
    onUpdateBudgetPos(updated);
  };

  const handleAutoDistributeFromIncome = () => {
    const baseIncome = weeklySim.totalWeekIncome > 0 ? weeklySim.totalWeekIncome : weeklySim.totalWeeklyTarget;
    if (baseIncome <= 0) return;
    const totalPct = budgetPos.reduce((acc, p) => acc + p.allocationPercent, 0) || 100;
    const updated = budgetPos.map(p => ({
      ...p,
      weeklyTarget: Math.round((baseIncome * (p.allocationPercent / totalPct)) / 1000) * 1000,
    }));
    onUpdateBudgetPos(updated);
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
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 space-y-3 overflow-x-hidden">
      
      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-[#FFD000] border border-black p-2.5 rounded-lg shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase text-black block">Total Saldo Bersih</span>
          <div className="text-sm sm:text-lg font-black font-mono text-black truncate mt-0.5 tabular-nums">
            Rp {stats.totalBalance.toLocaleString('id-ID')}
          </div>
          <span className="text-[9px] font-bold text-slate-800 block mt-0.5 truncate tabular-nums">
            Kas: {stats.kas.toLocaleString('id-ID')} · Bank: {stats.bank.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="bg-[#A3E635] border border-black p-2.5 rounded-lg shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase text-black block">Pemasukan</span>
          <div className="text-sm sm:text-lg font-black font-mono text-black truncate mt-0.5 tabular-nums">
            +Rp {stats.totalIncome.toLocaleString('id-ID')}
          </div>
          <span className="text-[9px] font-bold text-slate-800 block mt-0.5">
            {records.filter(r => r.type === 'income').length} Transaksi Masuk
          </span>
        </div>

        <div className="bg-[#FF4B82] text-white border border-black p-2.5 rounded-lg shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase text-white block">Pengeluaran</span>
          <div className="text-sm sm:text-lg font-black font-mono text-white truncate mt-0.5 tabular-nums">
            -Rp {stats.totalExpense.toLocaleString('id-ID')}
          </div>
          <span className="text-[9px] font-bold text-white/90 block mt-0.5">
            {records.filter(r => r.type === 'expense').length} Transaksi Keluar
          </span>
        </div>

        <div className="bg-[#00E5FF] border border-black p-2.5 rounded-lg shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase text-black block">Aman Hari Ini</span>
          <div className="text-sm sm:text-lg font-black font-mono text-black truncate mt-0.5 tabular-nums">
            Rp {weeklySim.safeDailySpend.toLocaleString('id-ID')}/hr
          </div>
          <span className="text-[9px] font-bold text-slate-800 block mt-0.5">
            Sisa minggu ini ({weeklySim.remainingDays} hr)
          </span>
        </div>
      </div>

      {/* OCR Error Banner */}
      {ocrError && (
        <div className="bg-[#FF4B82] text-white border-2 border-black p-2 rounded-lg text-[11px] font-bold flex items-center justify-between">
          <span>{ocrError}</span>
          <button onClick={() => setOcrError(null)} className="px-2 font-black">✕</button>
        </div>
      )}

      {/* Toolbar & Action Controls */}
      <div className="bg-white border border-black p-2.5 rounded-xl shadow-[2px_2px_0px_#000] space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          
          {/* Sub Tabs */}
          <div className="flex items-center gap-1 bg-[#FFFDF6] border border-black p-0.5 rounded-lg overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('transaksi')}
              className={`px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-black whitespace-nowrap transition-all ${
                activeTab === 'transaksi' ? 'bg-[#FFD000] text-black shadow-[1px_1px_0px_#000]' : 'text-slate-700'
              }`}
            >
              Transaksi ({records.length})
            </button>
            <button
              onClick={() => setActiveTab('simulasi')}
              className={`px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-black whitespace-nowrap transition-all ${
                activeTab === 'simulasi' ? 'bg-[#A3E635] text-black shadow-[1px_1px_0px_#000]' : 'text-slate-700'
              }`}
            >
              Simulasi & Budget Kos
            </button>
            <button
              onClick={() => setActiveTab('tabungan')}
              className={`px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-black whitespace-nowrap transition-all ${
                activeTab === 'tabungan' ? 'bg-[#00E5FF] text-black shadow-[1px_1px_0px_#000]' : 'text-slate-700'
              }`}
            >
              Tabungan ({savings.length})
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-black whitespace-nowrap transition-all ${
                activeTab === 'budget' ? 'bg-[#FF4B82] text-white shadow-[1px_1px_0px_#000]' : 'text-slate-700'
              }`}
            >
              Ringkas Pos
            </button>
          </div>

          {/* Actions: Scan Struk AI OCR & Manual Add */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <label className={`cursor-pointer bg-[#00E5FF] hover:bg-cyan-400 text-black px-2.5 py-1 rounded-lg border border-black font-black text-[10px] sm:text-[11px] uppercase flex items-center justify-center gap-1 shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${isOcrProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
              <IconCamera className="w-3.5 h-3.5" />
              <span>{isOcrProcessing ? 'Memproses AI...' : 'Scan Nota (AI OCR)'}</span>
              <input type="file" accept="image/*" capture="environment" onChange={handleScanReceipt} className="hidden" />
            </label>

            {onOpenGoogleSheets && (
              <button
                type="button"
                onClick={onOpenGoogleSheets}
                className="bg-[#10B981] text-white px-2.5 py-1 rounded-lg border border-black font-black text-[10px] sm:text-[11px] uppercase flex items-center justify-center gap-1 shadow-[1.5px_1.5px_0px_#000]"
              >
                <IconSheet className="w-3.5 h-3.5" />
                <span>Sheets</span>
              </button>
            )}

            <button
              onClick={() => { setPendingOcrItems([]); setShowAddModal(true); }}
              className="bg-[#FF4B82] text-white px-2.5 py-1 rounded-lg border border-black font-black text-[10px] sm:text-[11px] uppercase flex items-center justify-center gap-1 shadow-[1.5px_1.5px_0px_#000]"
            >
              <IconPlus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
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

      {/* ============================================================ */}
      {/* TAB 1: TRANSAKSI LIST */}
      {/* ============================================================ */}
      {activeTab === 'transaksi' && (
        <div className="space-y-2">
          {filteredRecords.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-2">
              <div className="w-10 h-10 bg-slate-100 border border-black rounded-full flex items-center justify-center mx-auto text-slate-700">
                <IconWallet className="w-5 h-5" />
              </div>
              <h4 className="font-black text-xs text-black">Belum Ada Transaksi Keuangan</h4>
              <p className="text-[10px] font-bold text-slate-500">
                Catat pemasukan harian atau scan foto nota struk belanja dengan Gemini AI OCR.
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-xs text-black truncate max-w-[160px] sm:max-w-xs">{r.note}</span>
                        <span className="bg-[#FFFDF6] border border-black text-[9px] font-bold px-1 rounded text-slate-700 shrink-0">
                          {r.category}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block">
                        {r.date} · {r.account} {r.source ? `· ${r.source}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-mono font-black text-xs sm:text-sm tabular-nums ${
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

      {/* ============================================================ */}
      {/* TAB 2: SIMULASI KEUANGAN & BUDGET POS KOS MINGGUAN */}
      {/* ============================================================ */}
      {activeTab === 'simulasi' && (
        <div className="space-y-3">
          {/* Weekly KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-white border-2 border-black p-2.5 rounded-xl comic-shadow">
              <span className="text-[9px] font-black uppercase text-slate-500 block">Pemasukan Minggu Ini</span>
              <div className="text-sm font-black font-mono text-green-700 tabular-nums mt-0.5">
                +Rp {weeklySim.totalWeekIncome.toLocaleString('id-ID')}
              </div>
              <span className="text-[9px] font-bold text-slate-500">Sejak {weeklySim.weekStartStr}</span>
            </div>

            <div className="bg-white border-2 border-black p-2.5 rounded-xl comic-shadow">
              <span className="text-[9px] font-black uppercase text-slate-500 block">Pengeluaran Minggu Ini</span>
              <div className="text-sm font-black font-mono text-red-600 tabular-nums mt-0.5">
                -Rp {weeklySim.totalWeekExpense.toLocaleString('id-ID')}
              </div>
              <span className="text-[9px] font-bold text-slate-500">Target: Rp {weeklySim.totalWeeklyTarget.toLocaleString('id-ID')}</span>
            </div>

            <div className="bg-[#A3E635] border-2 border-black p-2.5 rounded-xl comic-shadow">
              <span className="text-[9px] font-black uppercase text-black block">Target Tabungan/Mgg</span>
              <div className="text-sm font-black font-mono text-black tabular-nums mt-0.5">
                Rp {weeklySim.savingTargetWeek.toLocaleString('id-ID')}
              </div>
              <span className="text-[9px] font-bold text-slate-800">Disisihkan otomatis</span>
            </div>

            <div className="bg-[#FFD000] border-2 border-black p-2.5 rounded-xl comic-shadow">
              <span className="text-[9px] font-black uppercase text-black block">Limit Belanja Aman</span>
              <div className="text-sm font-black font-mono text-black tabular-nums mt-0.5">
                Rp {weeklySim.safeDailySpend.toLocaleString('id-ID')}/hari
              </div>
              <span className="text-[9px] font-bold text-slate-800">Sisa budget: Rp {weeklySim.remainingBudget.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Left: Input Pemasukan Harian & Rekap Per Hari */}
            <div className="bg-white border-2 border-black p-3 rounded-xl comic-shadow space-y-3">
              <div className="flex items-center justify-between border-b border-black pb-1.5">
                <h3 className="font-display font-black text-xs sm:text-sm uppercase text-black">
                  Input Pemasukan Harian & Laporan Hari
                </h3>
                <span className="text-[9px] font-black bg-[#00E5FF] border border-black px-1.5 py-0.5 rounded uppercase">
                  Senin - Minggu
                </span>
              </div>

              <form onSubmit={handleDailyIncomeSubmit} className="grid grid-cols-2 gap-2 text-xs font-bold">
                <div>
                  <label className="block text-[9px] uppercase text-slate-600 mb-0.5">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={incomeSimForm.date}
                    onChange={(e) => setIncomeSimForm({ ...incomeSimForm, date: e.target.value })}
                    className="w-full px-2 py-1 border border-black rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-slate-600 mb-0.5">Akun</label>
                  <select
                    value={incomeSimForm.account}
                    onChange={(e) => setIncomeSimForm({ ...incomeSimForm, account: e.target.value as any })}
                    className="w-full px-2 py-1 border border-black rounded-lg bg-white text-xs"
                  >
                    <option value="Bank">Bank</option>
                    <option value="Kas">Kas</option>
                    <option value="E-Wallet">E-Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-slate-600 mb-0.5">Nominal Masuk (IDR) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    placeholder="Contoh: 300000"
                    value={incomeSimForm.amount}
                    onChange={(e) => setIncomeSimForm({ ...incomeSimForm, amount: e.target.value })}
                    className="w-full px-2 py-1 border border-black rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-slate-600 mb-0.5">Sumber / Keterangan</label>
                  <input
                    type="text"
                    placeholder="Uang saku, proyek, kiriman..."
                    value={incomeSimForm.note}
                    onChange={(e) => setIncomeSimForm({ ...incomeSimForm, note: e.target.value })}
                    className="w-full px-2 py-1 border border-black rounded-lg text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="col-span-2 comic-button bg-[#A3E635] text-black py-1.5 border border-black rounded-lg font-black text-xs uppercase"
                >
                  + Catat Pemasukan Hari Ini (Auto Log Transaksi)
                </button>
              </form>

              {/* Breakdown Per Hari (Senin..Minggu) */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-700 block">
                  Distribusi Hari Dapat Pemasukan:
                </span>
                <div className="grid grid-cols-7 gap-1">
                  {weeklySim.byDay.map(d => (
                    <div key={d.dayName} className={`p-1 rounded border border-black text-center ${d.sum > 0 ? 'bg-[#A3E635]/50' : 'bg-slate-50'}`}>
                      <span className="text-[8px] font-black uppercase block text-black">{d.dayName.slice(0, 3)}</span>
                      <span className="text-[9px] font-mono font-bold text-black tabular-nums block truncate">
                        {d.sum > 0 ? `${Math.round(d.sum / 1000)}k` : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Daily Income Entries */}
              {dailyIncomes.length > 0 && (
                <div className="space-y-1 max-h-36 overflow-y-auto pt-1">
                  {dailyIncomes.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between bg-[#FFFDF6] border border-black px-2 py-1 rounded text-[10px] font-bold">
                      <div className="truncate pr-2">
                        <span className="bg-[#FFD000] border border-black px-1 rounded text-[9px] mr-1.5">{entry.dayName}</span>
                        <span className="text-black">{entry.note}</span>
                        <span className="text-slate-400 font-mono ml-1.5">{entry.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-green-700 tabular-nums">+Rp {entry.amount.toLocaleString('id-ID')}</span>
                        <button onClick={() => onDeleteDailyIncome(entry.id)} className="text-slate-400 hover:text-red-600">
                          <IconTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Pembagian Pos Anggaran Kos Mingguan */}
            <div className="bg-white border-2 border-black p-3 rounded-xl comic-shadow space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black pb-1.5">
                <div>
                  <h3 className="font-display font-black text-xs sm:text-sm uppercase text-black">
                    Alokasi Pos Kos Mingguan & Tabungan
                  </h3>
                  <span className="text-[9px] font-bold text-slate-600">
                    Bandingkan target pos vs pengeluaran minggu ini secara real-time
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoDistributeFromIncome}
                  className="comic-button bg-[#00E5FF] text-black px-2 py-1 rounded-lg border border-black font-black text-[9px] uppercase"
                >
                  Bagi Otomatis %
                </button>
              </div>

              <div className="space-y-2">
                {weeklySim.posBreakdown.map(pos => {
                  const isOver = pos.remaining < 0;
                  return (
                    <div key={pos.id} className="bg-[#FFFDF6] border border-black p-2 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full border border-black shrink-0" style={{ backgroundColor: pos.color }} />
                          <span className="font-black text-xs text-black truncate">{pos.name}</span>
                        </div>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border border-black shrink-0 ${
                          isOver ? 'bg-[#FF4B82] text-white' : 'bg-[#A3E635] text-black'
                        }`}>
                          {isOver ? 'OVER BUDGET' : 'AMAN'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                        <div>
                          <span className="text-slate-500 block text-[9px]">Budget Mingguan (Rp)</span>
                          <input
                            type="number"
                            step="5000"
                            value={pos.weeklyTarget}
                            onChange={(e) => handlePosChange(pos.id, 'weeklyTarget', Number(e.target.value))}
                            className="w-full px-1.5 py-0.5 bg-white border border-black rounded font-mono text-xs tabular-nums"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">Porsi Alokasi (%)</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={pos.allocationPercent}
                            onChange={(e) => handlePosChange(pos.id, 'allocationPercent', Number(e.target.value))}
                            className="w-full px-1.5 py-0.5 bg-white border border-black rounded font-mono text-xs tabular-nums"
                          />
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[10px] font-mono font-bold tabular-nums">
                          <span>Terpakai: Rp {pos.spent.toLocaleString('id-ID')}</span>
                          <span className={isOver ? 'text-red-600' : 'text-green-700'}>
                            Sisa: Rp {pos.remaining.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="w-full bg-white border border-black h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{ width: `${pos.pct}%`, backgroundColor: isOver ? '#FF4B82' : pos.color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: TABUNGAN */}
      {/* ============================================================ */}
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
                    <div className="flex justify-between text-[11px] font-mono font-bold tabular-nums">
                      <span>Rp {goal.currentAmount.toLocaleString('id-ID')}</span>
                      <span className="text-slate-500">Rp {goal.targetAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="w-full bg-slate-100 border border-black h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#A3E635] h-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 pt-1">
                    {[10000, 25000, 50000].map(inc => (
                      <button
                        key={inc}
                        onClick={() => onUpdateSaving(goal.id, goal.currentAmount + inc)}
                        className="text-[9px] font-black bg-[#FFD000] border border-black px-1.5 py-0.5 rounded"
                      >
                        +{inc / 1000}k
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: RINGKAS POS */}
      {/* ============================================================ */}
      {activeTab === 'budget' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {weeklySim.posBreakdown.map(b => (
            <div key={b.id} className="bg-white border border-black rounded-lg p-3 shadow-[2px_2px_0px_#000] space-y-1">
              <span className="text-[9px] font-black uppercase bg-[#FFFDF6] border border-black px-1.5 py-0.2 rounded text-black">
                Mingguan ({b.allocationPercent}%)
              </span>
              <h4 className="font-black text-xs text-black uppercase">{b.name}</h4>
              <div className="text-sm font-black font-mono text-[#FF4B82] tabular-nums">
                Target: Rp {b.weeklyTarget.toLocaleString('id-ID')}
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 tabular-nums">
                Terpakai: Rp {b.spent.toLocaleString('id-ID')} · Sisa: Rp {b.remaining.toLocaleString('id-ID')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD TRANSACTION (WITH OCR MULTI-ITEM PREVIEW) */}
      {/* ============================================================ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2.5">
          <div className="bg-white border-2 border-black rounded-xl p-3.5 sm:p-4 shadow-[5px_5px_0px_#000] max-w-sm w-full space-y-2.5 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-black pb-2">
              <h3 className="font-black text-xs sm:text-sm uppercase text-black flex items-center gap-1.5">
                <IconReceipt className="w-4 h-4" />
                <span>CATAT TRANSAKSI KEUANGAN</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="font-bold text-xs">✕</button>
            </div>

            {pendingOcrItems.length > 0 && (
              <div className="bg-[#A3E635]/30 border border-black rounded-lg p-2 space-y-1.5 text-[10px]">
                <div className="flex items-center justify-between font-black text-black">
                  <span className="flex items-center gap-1">
                    <IconSparkles className="w-3.5 h-3.5" />
                    AI OCR Mendeteksi {pendingOcrItems.length} Barang Nota:
                  </span>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-0.5 bg-white border border-black rounded p-1.5">
                  {pendingOcrItems.map((it, idx) => (
                    <div key={idx} className="flex justify-between font-mono text-[9px]">
                      <span className="truncate pr-2">{it.quantity}x {it.name}</span>
                      <span className="shrink-0">Rp {(it.price || 0).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={importOcrToKos}
                    onChange={(e) => setImportOcrToKos(e.target.checked)}
                    className="w-3.5 h-3.5 accent-black"
                  />
                  <span>Sekaligus tambah stok barang di atas ke KosMan</span>
                </label>
              </div>
            )}

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
                  <span className="font-black text-black flex items-center gap-1">
                    <IconShoppingBag className="w-3 h-3" />
                    Auto-Sync Barang KosMan:
                  </span>
                  <select
                    onChange={(e) => {
                      const selected = kosItems.find(item => item.id === e.target.value);
                      if (selected) {
                        setFormData({
                          ...formData,
                          category: selected.category,
                          note: selected.name,
                          amount: selected.price ? selected.price.toString() : formData.amount
                        });
                      }
                    }}
                    defaultValue=""
                    className="w-full px-2 py-1 border border-black rounded font-bold text-[10px] bg-white cursor-pointer"
                  >
                    <option value="" disabled>-- Pilih Item Kosan --</option>
                    {kosItems.slice(0, 60).map(item => (
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
                    <option value="Bumbu Dapur">Bumbu Dapur</option>
                    <option value="Kebersihan & Toilet">Kebersihan & Toilet</option>
                    <option value="Kesehatan">Kesehatan</option>
                    <option value="Keperluan Rumah Tangga">Keperluan Rumah Tangga</option>
                    <option value="Kelistrikan & Kos">Kelistrikan & Kos</option>
                    <option value="Sewa Kos">Sewa Kos</option>
                    <option value="Belanja KosMan">Belanja KosMan</option>
                    <option value="Keinginan">Keinginan</option>
                    <option value="Transportasi">Transportasi</option>
                    <option value="Tabungan">Tabungan</option>
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
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1 border border-black rounded-lg font-bold text-xs">
                  Batal
                </button>
                <button type="submit" className="px-4 py-1 bg-[#FFD000] text-black border border-black rounded-lg font-black text-xs uppercase shadow-[1.5px_1.5px_0px_#000]">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD SAVING GOAL */}
      {/* ============================================================ */}
      {showSavingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2.5">
          <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[5px_5px_0px_#000] max-w-sm w-full space-y-3">
            <div className="flex items-center justify-between border-b border-black pb-2">
              <h3 className="font-black text-sm uppercase text-black">TAMBAH TARGET TABUNGAN</h3>
              <button onClick={() => setShowSavingModal(false)} className="font-bold text-xs">✕</button>
            </div>
            <form onSubmit={handleSavingSubmit} className="space-y-2.5 text-xs font-bold">
              <div>
                <label className="block text-slate-700 uppercase text-[10px] mb-1">Nama Target *</label>
                <input
                  type="text"
                  required
                  value={savingFormData.name}
                  onChange={(e) => setSavingFormData({ ...savingFormData, name: e.target.value })}
                  placeholder="Contoh: Dana Darurat, Laptop Baru..."
                  className="w-full px-2.5 py-1.5 border border-black rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 uppercase text-[10px] mb-1">Target (IDR) *</label>
                  <input
                    type="number"
                    required
                    min="10000"
                    step="10000"
                    value={savingFormData.targetAmount}
                    onChange={(e) => setSavingFormData({ ...savingFormData, targetAmount: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-black rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 uppercase text-[10px] mb-1">Saldo Awal</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={savingFormData.currentAmount}
                    onChange={(e) => setSavingFormData({ ...savingFormData, currentAmount: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-black rounded-lg font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 uppercase text-[10px] mb-1">Lokasi Simpan</label>
                <input
                  type="text"
                  value={savingFormData.location}
                  onChange={(e) => setSavingFormData({ ...savingFormData, location: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-black rounded-lg text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowSavingModal(false)} className="px-3 py-1 border border-black rounded-lg text-xs">
                  Batal
                </button>
                <button type="submit" className="px-4 py-1 bg-[#00E5FF] text-black border border-black rounded-lg font-black text-xs uppercase">
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
