import React, { useState, useEffect } from 'react';
import { 
  KosItem, KosCategory, FinanceRecord, SavingGoal, Budget, 
  WishlistItem, BudgetPos, DailyIncomeEntry,
  RoutineActivity, MissedPrayer, DailyGoal, TripLog, WorkoutLog,
  NormalNote, IGNote, PersonalNote, AppVersionState, FardhuPrayer
} from './types/kosman';
import { INITIAL_KOS_ITEMS, normalizeKosCategory } from './data/kosmanItems';
import { 
  INITIAL_APP_VERSIONS, INITIAL_FINANCE_RECORDS, INITIAL_SAVING_GOALS, 
  INITIAL_BUDGETS, INITIAL_WISHLIST_ITEMS, INITIAL_BUDGET_POS, INITIAL_DAILY_INCOMES,
  INITIAL_ROUTINE_ACTIVITIES, INITIAL_MISSED_PRAYERS, 
  INITIAL_DAILY_GOALS, INITIAL_WORKOUT_LOGS, INITIAL_TRIP_LOGS, 
  INITIAL_NORMAL_NOTES, INITIAL_IG_NOTES, INITIAL_PERSONAL_NOTES 
} from './data/initialAppData';

import { Navbar, ActiveAppView } from './components/Navbar';
import { HubDashboard } from './components/HubDashboard';
import { KosManView } from './components/KosManView';
import { FinanceView, OcrExtractedItem } from './components/FinanceView';
import { ActivitiesView } from './components/ActivitiesView';
import { NotesView } from './components/NotesView';
import { WorshipView } from './components/WorshipView';
import { ChatGPTModal } from './components/ChatGPTModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/PWAInstallBanner';
import { 
  autoSyncFinanceToSheets, autoSyncKosmanToSheets, 
  autoSyncWishlistToSheets, autoSyncActivityToSheets 
} from './services/googleSheetsAutoSync';

// Clean zero-state reset for v2.0.0
const V2_CLEAN_RESET_KEY = 'manageme_v2_zero_state_applied';
if (typeof window !== 'undefined' && !localStorage.getItem(V2_CLEAN_RESET_KEY)) {
  localStorage.removeItem('manageme_kosman_items');
  localStorage.removeItem('manageme_finance_records');
  localStorage.removeItem('manageme_routines');
  localStorage.removeItem('manageme_prayers');
  localStorage.removeItem('manageme_daily_goals');
  localStorage.removeItem('manageme_trips');
  localStorage.removeItem('manageme_workouts');
  localStorage.removeItem('manageme_savings');
  localStorage.removeItem('manageme_budgets');
  localStorage.setItem(V2_CLEAN_RESET_KEY, 'true');
}

const getIndonesianDayName = (dateStr: string): string => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const parsed = new Date(dateStr + 'T00:00:00');
  return isNaN(parsed.getTime()) ? 'Senin' : days[parsed.getDay()];
};

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveAppView>('hub');
  const [financeInitialTab, setFinanceInitialTab] = useState<'transaksi' | 'simulasi' | 'tabungan' | 'budget'>('transaksi');

  // Modals state
  const [showChatGPTModal, setShowChatGPTModal] = useState(false);
  const [showGoogleSheetsModal, setShowGoogleSheetsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // App Versions state (Always auto-bumped on code update, managed in Settings)
  const [versions, setVersions] = useState<AppVersionState>(() => {
    const saved = localStorage.getItem('manageme_app_versions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Auto-sync version bump to latest release v2.3.0 when app code updates
        const releaseVer = INITIAL_APP_VERSIONS.hub;
        const bumped: AppVersionState = {
          hub: releaseVer,
          kosman: parsed.kosman && parsed.kosman >= releaseVer ? parsed.kosman : releaseVer,
          finance: parsed.finance && parsed.finance >= releaseVer ? parsed.finance : releaseVer,
          activities: parsed.activities && parsed.activities >= releaseVer ? parsed.activities : releaseVer,
          notes: parsed.notes && parsed.notes >= releaseVer ? parsed.notes : releaseVer,
          worship: parsed.worship && parsed.worship >= releaseVer ? parsed.worship : releaseVer,
        };
        return bumped;
      } catch (e) {
        console.error('Failed to parse app versions:', e);
      }
    }
    return INITIAL_APP_VERSIONS;
  });

  // KosMan Items Dataset State (Normalizes legacy categories & populates multi-tags)
  const [items, setItems] = useState<KosItem[]>(() => {
    const saved = localStorage.getItem('manageme_kosman_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((it: any) => {
            const normCat = normalizeKosCategory(it.category);
            const normTags: KosCategory[] = Array.isArray(it.tags) && it.tags.length > 0
              ? Array.from(new Set(it.tags.map(normalizeKosCategory)))
              : [normCat];
            return { ...it, category: normCat, tags: normTags };
          });
        }
      } catch (err) {
        console.error('Failed to parse saved kosman items:', err);
      }
    }
    return INITIAL_KOS_ITEMS;
  });

  // Wishlist & Buying Groceries State
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem('manageme_wishlist_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.error('Failed to parse wishlist:', err);
      }
    }
    return INITIAL_WISHLIST_ITEMS;
  });

  // Kos Weekly Budget Pos & Daily Incomes State
  const [budgetPos, setBudgetPos] = useState<BudgetPos[]>(() => {
    const saved = localStorage.getItem('manageme_budget_pos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {
        console.error('Failed to parse budget pos:', err);
      }
    }
    return INITIAL_BUDGET_POS;
  });

  const [dailyIncomes, setDailyIncomes] = useState<DailyIncomeEntry[]>(() => {
    const saved = localStorage.getItem('manageme_daily_incomes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.error('Failed to parse daily incomes:', err);
      }
    }
    return INITIAL_DAILY_INCOMES;
  });

  // Keuangan / Finance State
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>(() => {
    const saved = localStorage.getItem('manageme_finance_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.error('Failed to parse finance records:', err);
      }
    }
    return INITIAL_FINANCE_RECORDS;
  });

  const [savings, setSavings] = useState<SavingGoal[]>(() => {
    const saved = localStorage.getItem('manageme_savings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.error('Failed to parse savings:', err);
      }
    }
    return INITIAL_SAVING_GOALS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('manageme_budgets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.error('Failed to parse budgets:', err);
      }
    }
    return INITIAL_BUDGETS;
  });

  // Daily Log & Activities State
  const [routines, setRoutines] = useState<RoutineActivity[]>(() => {
    const saved = localStorage.getItem('manageme_routines');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.error('Failed to parse routines:', err);
      }
    }
    return INITIAL_ROUTINE_ACTIVITIES;
  });

  const [prayers, setPrayers] = useState<MissedPrayer[]>(() => {
    const saved = localStorage.getItem('manageme_prayers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.error('Failed to parse prayers:', err);
      }
    }
    return INITIAL_MISSED_PRAYERS;
  });

  const [goals, setGoals] = useState<DailyGoal[]>(() => {
    const saved = localStorage.getItem('manageme_daily_goals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.error('Failed to parse daily goals:', err);
      }
    }
    return INITIAL_DAILY_GOALS;
  });

  const [trips, setTrips] = useState<TripLog[]>(() => {
    const saved = localStorage.getItem('manageme_trips');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.error('Failed to parse trips:', err);
      }
    }
    return INITIAL_TRIP_LOGS;
  });

  const [workouts, setWorkouts] = useState<WorkoutLog[]>(() => {
    const saved = localStorage.getItem('manageme_workouts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.error('Failed to parse workouts:', err);
      }
    }
    return INITIAL_WORKOUT_LOGS;
  });

  // Notes State
  const [normalNotes, setNormalNotes] = useState<NormalNote[]>(() => {
    const saved = localStorage.getItem('manageme_normal_notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.error('Failed to parse normal notes:', err);
      }
    }
    return INITIAL_NORMAL_NOTES;
  });

  const [igNotes, setIgNotes] = useState<IGNote[]>(() => {
    const saved = localStorage.getItem('manageme_ig_notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.error('Failed to parse ig notes:', err);
      }
    }
    return INITIAL_IG_NOTES;
  });

  const [personalNotes, setPersonalNotes] = useState<PersonalNote[]>(() => {
    const saved = localStorage.getItem('manageme_personal_notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.error('Failed to parse personal notes:', err);
      }
    }
    return INITIAL_PERSONAL_NOTES;
  });

  // LocalStorage Synchronizers
  useEffect(() => { localStorage.setItem('manageme_app_versions', JSON.stringify(versions)); }, [versions]);
  useEffect(() => { localStorage.setItem('manageme_kosman_items', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('manageme_wishlist_items', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('manageme_budget_pos', JSON.stringify(budgetPos)); }, [budgetPos]);
  useEffect(() => { localStorage.setItem('manageme_daily_incomes', JSON.stringify(dailyIncomes)); }, [dailyIncomes]);
  useEffect(() => { localStorage.setItem('manageme_finance_records', JSON.stringify(financeRecords)); }, [financeRecords]);
  useEffect(() => { localStorage.setItem('manageme_savings', JSON.stringify(savings)); }, [savings]);
  useEffect(() => { localStorage.setItem('manageme_budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('manageme_routines', JSON.stringify(routines)); }, [routines]);
  useEffect(() => { localStorage.setItem('manageme_prayers', JSON.stringify(prayers)); }, [prayers]);
  useEffect(() => { localStorage.setItem('manageme_daily_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('manageme_trips', JSON.stringify(trips)); }, [trips]);
  useEffect(() => { localStorage.setItem('manageme_workouts', JSON.stringify(workouts)); }, [workouts]);
  useEffect(() => { localStorage.setItem('manageme_normal_notes', JSON.stringify(normalNotes)); }, [normalNotes]);
  useEffect(() => { localStorage.setItem('manageme_ig_notes', JSON.stringify(igNotes)); }, [igNotes]);
  useEffect(() => { localStorage.setItem('manageme_personal_notes', JSON.stringify(personalNotes)); }, [personalNotes]);

  // KosMan Item Handlers
  const handleAddItem = (newItemData: Omit<KosItem, 'id' | 'totalSpend'>) => {
    const newItem: KosItem = {
      ...newItemData,
      id: 'item-' + Date.now(),
      totalSpend: 0,
    };
    setItems(prev => [newItem, ...prev]);
    autoSyncKosmanToSheets(newItem);
  };

  const handleUpdateItem = (id: string, updates: Partial<KosItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        autoSyncKosmanToSheets(updated);
        return updated;
      }
      return item;
    }));
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Wishlist Handlers
  const handleAddWishlistItem = (newWish: Omit<WishlistItem, 'id' | 'createdAt' | 'purchased'>) => {
    const wish: WishlistItem = {
      ...newWish,
      id: 'wish-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      purchased: false,
      createdAt: Date.now(),
    };
    setWishlist(prev => [wish, ...prev]);
    autoSyncWishlistToSheets(wish);
  };

  const handleToggleWishlistPurchased = (id: string, alsoLogFinance: boolean) => {
    const target = wishlist.find(w => w.id === id);
    if (!target) return;

    const nowPurchased = !target.purchased;
    const updatedWish = { ...target, purchased: nowPurchased };
    setWishlist(prev => prev.map(w => (w.id === id ? updatedWish : w)));

    if (nowPurchased) {
      autoSyncWishlistToSheets(updatedWish);
      const today = new Date().toISOString().split('T')[0];

      // Update matching KosMan item quantity or add new
      setItems(prevItems => {
        const matchIdx = prevItems.findIndex(
          it => it.id === target.linkedKosItemId || it.name.toLowerCase() === target.name.toLowerCase()
        );
        if (matchIdx >= 0) {
          const cloned = [...prevItems];
          const existing = cloned[matchIdx];
          const updatedItem: KosItem = {
            ...existing,
            quantity: existing.quantity + target.quantity,
            timesPurchased: existing.timesPurchased + 1,
            totalSpend: existing.totalSpend + target.quantity * target.estimatedPrice,
            lastPurchasedDate: today,
          };
          cloned[matchIdx] = updatedItem;
          autoSyncKosmanToSheets(updatedItem);
          return cloned;
        }
        const newKos: KosItem = {
          id: 'item-wish-' + Date.now(),
          name: target.name,
          category: target.shoppingCategory,
          tags: [target.shoppingCategory, 'Belanja'],
          subCategory: target.subCategory || 'Belanja Mingguan',
          quantity: target.quantity,
          unit: target.unit,
          price: target.estimatedPrice,
          timesPurchased: 1,
          totalSpend: target.quantity * target.estimatedPrice,
          minThreshold: 1,
          lastPurchasedDate: today,
        };
        autoSyncKosmanToSheets(newKos);
        return [newKos, ...prevItems];
      });

      // Optionally create Finance expense record
      if (alsoLogFinance && target.estimatedPrice > 0) {
        const finRec: FinanceRecord = {
          id: 'fin-wish-' + Date.now(),
          type: 'expense',
          amount: target.quantity * target.estimatedPrice,
          category: target.shoppingCategory,
          subCategory: target.subCategory,
          note: `Beli Wishlist: ${target.name} (${target.quantity} ${target.unit})`,
          account: 'Kas',
          date: today,
          source: 'wishlist',
          createdAt: Date.now(),
        };
        setFinanceRecords(prev => [finRec, ...prev]);
        autoSyncFinanceToSheets(finRec);
      }
    }
  };

  const handleDeleteWishlistItem = (id: string) => {
    setWishlist(prev => prev.filter(w => w.id !== id));
  };

  const handlePullLowStockToWishlist = () => {
    const lowOrEmpty = items.filter(i => i.quantity <= i.minThreshold);
    const existingPendingNames = new Set(
      wishlist.filter(w => !w.purchased).map(w => w.name.toLowerCase())
    );
    const additions: WishlistItem[] = lowOrEmpty
      .filter(i => !existingPendingNames.has(i.name.toLowerCase()))
      .map((i, idx) => ({
        id: `wish-low-${Date.now()}-${idx}`,
        name: i.name,
        shoppingCategory: i.category,
        subCategory: i.subCategory,
        quantity: 1,
        unit: i.unit,
        estimatedPrice: i.price,
        priority: i.quantity === 0 ? 'Wajib' : 'Sedang',
        purchased: false,
        linkedKosItemId: i.id,
        source: 'low-stock',
        createdAt: Date.now() + idx,
      }));

    if (additions.length > 0) {
      setWishlist(prev => [...additions, ...prev]);
      additions.forEach(w => autoSyncWishlistToSheets(w));
    }
  };

  const handleQuickPayKosUtility = (item: KosItem) => {
    const today = new Date().toISOString().split('T')[0];
    const finRec: FinanceRecord = {
      id: 'fin-kos-' + Date.now(),
      type: 'expense',
      amount: item.price,
      category: 'Kelistrikan & Kos',
      subCategory: item.subCategory,
      note: `Bayar Pos Kos: ${item.name}`,
      account: 'Kas',
      date: today,
      source: 'app',
      createdAt: Date.now(),
    };
    setFinanceRecords(prev => [finRec, ...prev]);
    autoSyncFinanceToSheets(finRec);
    handleUpdateItem(item.id, {
      timesPurchased: (item.timesPurchased || 0) + 1,
      totalSpend: (item.totalSpend || 0) + item.price,
      lastPurchasedDate: today,
    });
  };

  const handleImportParsedChatGPTItems = (parsedList: { name: string; quantity: number; price: number; category?: KosCategory }[]) => {
    const newItems: KosItem[] = parsedList.map((p, idx) => {
      const cat = p.category || 'Bumbu Dapur';
      return {
        id: 'chatgpt-import-' + Date.now() + '-' + idx,
        name: p.name,
        category: cat,
        tags: [cat, 'Belanja'],
        subCategory: 'Umum',
        quantity: p.quantity,
        unit: 'buah',
        price: p.price,
        timesPurchased: 0,
        totalSpend: 0,
        minThreshold: 1,
        lastPurchasedDate: new Date().toISOString().split('T')[0],
        notes: 'Imported via ChatGPT'
      };
    });
    setItems(prev => [...newItems, ...prev]);
    newItems.forEach(it => autoSyncKosmanToSheets(it));
  };

  const handleImportParsedChatGPTWishlist = (parsedList: { name: string; quantity: number; price: number; category?: KosCategory }[]) => {
    const newWishes: WishlistItem[] = parsedList.map((p, idx) => ({
      id: 'chatgpt-wish-' + Date.now() + '-' + idx,
      name: p.name,
      shoppingCategory: p.category || 'Belanja',
      subCategory: 'Belanja Mingguan',
      quantity: p.quantity,
      unit: 'buah',
      estimatedPrice: p.price,
      priority: 'Sedang',
      purchased: false,
      source: 'chatgpt',
      createdAt: Date.now() + idx,
    }));
    setWishlist(prev => [...newWishes, ...prev]);
    newWishes.forEach(w => autoSyncWishlistToSheets(w));
  };

  const handleImportOcrItems = (ocrItems: OcrExtractedItem[]) => {
    const today = new Date().toISOString().split('T')[0];
    setItems(prevItems => {
      const updatedList = [...prevItems];
      ocrItems.forEach((ocrIt, idx) => {
        if (!ocrIt.name) return;
        const foundIdx = updatedList.findIndex(i => i.name.toLowerCase() === ocrIt.name.toLowerCase());
        const qty = Math.max(1, Number(ocrIt.quantity) || 1);
        const unitPrice = Number(ocrIt.price) || 10000;
        if (foundIdx >= 0) {
          const cur = updatedList[foundIdx];
          updatedList[foundIdx] = {
            ...cur,
            quantity: cur.quantity + qty,
            timesPurchased: cur.timesPurchased + 1,
            totalSpend: cur.totalSpend + qty * unitPrice,
            lastPurchasedDate: today,
          };
          autoSyncKosmanToSheets(updatedList[foundIdx]);
        } else {
          const cat = normalizeKosCategory(ocrIt.suggestedCategory || 'Belanja');
          const created: KosItem = {
            id: `ocr-item-${Date.now()}-${idx}`,
            name: ocrIt.name,
            category: cat,
            tags: [cat, 'Belanja'],
            subCategory: 'Umum',
            quantity: qty,
            unit: ocrIt.unit || 'buah',
            price: unitPrice,
            timesPurchased: 1,
            totalSpend: qty * unitPrice,
            minThreshold: 1,
            lastPurchasedDate: today,
            notes: 'Ditambahkan dari Scan Nota AI OCR',
          };
          updatedList.unshift(created);
          autoSyncKosmanToSheets(created);
        }
      });
      return updatedList;
    });
  };

  // Finance & Daily Income Handlers
  const handleAddFinanceRecord = (newRec: Omit<FinanceRecord, 'id' | 'createdAt'>) => {
    const record: FinanceRecord = {
      ...newRec,
      id: 'fin-' + Date.now(),
      createdAt: Date.now()
    };
    setFinanceRecords(prev => [record, ...prev]);
    autoSyncFinanceToSheets(record);

    if (newRec.type === 'expense') {
      const lowerNote = (newRec.note || '').toLowerCase();
      setItems(prevItems => {
        let matched = false;
        const updated = prevItems.map(item => {
          const lowerName = item.name.toLowerCase();
          if (lowerNote.length > 2 && (lowerNote.includes(lowerName) || lowerName.includes(lowerNote))) {
            matched = true;
            const updatedItem = {
              ...item,
              quantity: (item.quantity || 0) + 1,
              timesPurchased: (item.timesPurchased || 0) + 1,
              totalSpend: (item.totalSpend || 0) + newRec.amount,
              lastPurchasedDate: newRec.date || new Date().toISOString().split('T')[0]
            };
            autoSyncKosmanToSheets(updatedItem);
            return updatedItem;
          }
          return item;
        });
        return matched ? updated : prevItems;
      });
    }
  };

  const handleDeleteFinanceRecord = (id: string) => {
    setFinanceRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleAddDailyIncome = (entry: Omit<DailyIncomeEntry, 'id' | 'dayName'>, account: 'Kas' | 'Bank' | 'E-Wallet') => {
    const dayName = getIndonesianDayName(entry.date);
    const newEntry: DailyIncomeEntry = {
      ...entry,
      id: 'inc-' + Date.now(),
      dayName,
    };
    setDailyIncomes(prev => [newEntry, ...prev]);

    const finRec: FinanceRecord = {
      id: 'fin-inc-' + Date.now(),
      type: 'income',
      amount: entry.amount,
      category: 'Gaji / Kiriman',
      subCategory: dayName,
      note: `${entry.note} (${dayName})`,
      account,
      date: entry.date,
      source: 'app',
      createdAt: Date.now(),
    };
    setFinanceRecords(prev => [finRec, ...prev]);
    autoSyncFinanceToSheets(finRec);
  };

  const handleDeleteDailyIncome = (id: string) => {
    setDailyIncomes(prev => prev.filter(d => d.id !== id));
  };

  const handleAddSaving = (newSaving: Omit<SavingGoal, 'id'>) => {
    const item: SavingGoal = {
      ...newSaving,
      id: 'save-' + Date.now()
    };
    setSavings(prev => [...prev, item]);
  };

  const handleUpdateSaving = (id: string, currentAmount: number) => {
    setSavings(prev => prev.map(s => (s.id === id ? { ...s, currentAmount } : s)));
  };

  const handleDeleteSaving = (id: string) => {
    setSavings(prev => prev.filter(s => s.id !== id));
  };

  // 2-Way Google Sheets Pull Hydrator
  const handleSyncPullSuccess = (pulled: {
    items: KosItem[];
    wishlist: WishlistItem[];
    financeRecords: FinanceRecord[];
    budgetPos: BudgetPos[];
  }) => {
    if (pulled.items.length > 0) setItems(pulled.items);
    if (pulled.wishlist.length > 0) setWishlist(pulled.wishlist);
    if (pulled.financeRecords.length > 0) setFinanceRecords(pulled.financeRecords);
    if (pulled.budgetPos.length > 0) setBudgetPos(pulled.budgetPos);
  };

  // Daily Log Handlers
  const handleToggleRoutine = (id: string) => {
    setRoutines(prev => prev.map(r => (r.id === id ? { ...r, completedToday: !r.completedToday } : r)));
  };
  const handleAddRoutine = (name: string, category: string) => {
    setRoutines(prev => [...prev, { id: 'act-' + Date.now(), name, category, completedToday: false }]);
  };
  const handleDeleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
  };
  const handleTogglePrayer = (id: string) => {
    setPrayers(prev => prev.map(p => (p.id === id ? { ...p, completed: !p.completed } : p)));
  };
  const handleAddPrayer = (prayer: FardhuPrayer, dateInfo: string) => {
    setPrayers(prev => [{ id: 'mp-' + Date.now(), prayer, dateInfo, completed: false }, ...prev]);
  };
  const handleDeletePrayer = (id: string) => {
    setPrayers(prev => prev.filter(p => p.id !== id));
  };
  const handleToggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, completed: !g.completed } : g)));
  };
  const handleAddGoal = (text: string, category: string) => {
    setGoals(prev => [...prev, { id: 'dg-' + Date.now(), text, category, completed: false }]);
  };
  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };
  const handleAddTrip = (trip: Omit<TripLog, 'id'>) => {
    const newTrip: TripLog = { ...trip, id: 'trip-' + Date.now() };
    setTrips(prev => [newTrip, ...prev]);
    autoSyncActivityToSheets({
      id: newTrip.id,
      date: newTrip.date,
      type: 'Perjalanan',
      title: `${newTrip.origin} -> ${newTrip.destination}`,
      info: `Kendaraan: ${newTrip.vehicle}${newTrip.fuelCost ? `, BBM: Rp ${newTrip.fuelCost}` : ''}${newTrip.tollCost ? `, Tol: Rp ${newTrip.tollCost}` : ''}`
    });
  };
  const handleAddWorkout = (workout: Omit<WorkoutLog, 'id'>) => {
    setWorkouts(prev => [{ ...workout, id: 'wo-' + Date.now() }, ...prev]);
  };

  // Notes Handlers
  const handleAddNormalNote = (title: string, content: string, category: string) => {
    setNormalNotes(prev => [{ id: 'nn-' + Date.now(), title, content, category, updatedAt: Date.now() }, ...prev]);
  };
  const handleDeleteNormalNote = (id: string) => {
    setNormalNotes(prev => prev.filter(n => n.id !== id));
  };
  const handleAddIGNote = (songTitle: string, content: string) => {
    setIgNotes(prev => [{ id: 'ign-' + Date.now(), songTitle, owner: 'ManageMe', content, backgroundColor: '#18181b', updatedAt: Date.now() }, ...prev]);
  };
  const handleDeleteIGNote = (id: string) => {
    setIgNotes(prev => prev.filter(n => n.id !== id));
  };
  const handleAddPersonalNote = (personName: string, extraNotes: string, customFields: { key: string; value: string }[]) => {
    setPersonalNotes(prev => [{ id: 'pn-' + Date.now(), personName, extraNotes, customFields, updatedAt: Date.now() }, ...prev]);
  };
  const handleDeletePersonalNote = (id: string) => {
    setPersonalNotes(prev => prev.filter(n => n.id !== id));
  };

  // Reset all data to factory default
  const handleResetAllData = () => {
    setItems(INITIAL_KOS_ITEMS);
    setWishlist(INITIAL_WISHLIST_ITEMS);
    setBudgetPos(INITIAL_BUDGET_POS);
    setDailyIncomes(INITIAL_DAILY_INCOMES);
    setFinanceRecords(INITIAL_FINANCE_RECORDS);
    setSavings(INITIAL_SAVING_GOALS);
    setBudgets(INITIAL_BUDGETS);
    setRoutines(INITIAL_ROUTINE_ACTIVITIES);
    setPrayers(INITIAL_MISSED_PRAYERS);
    setGoals(INITIAL_DAILY_GOALS);
    setTrips(INITIAL_TRIP_LOGS);
    setWorkouts(INITIAL_WORKOUT_LOGS);
    setNormalNotes(INITIAL_NORMAL_NOTES);
    setIgNotes(INITIAL_IG_NOTES);
    setPersonalNotes(INITIAL_PERSONAL_NOTES);
    setVersions(INITIAL_APP_VERSIONS);
    localStorage.clear();
  };

  const handleImportAllData = (backupData: any) => {
    if (backupData.items) setItems(backupData.items);
    if (backupData.wishlist) setWishlist(backupData.wishlist);
    if (backupData.budgetPos) setBudgetPos(backupData.budgetPos);
    if (backupData.dailyIncomes) setDailyIncomes(backupData.dailyIncomes);
    if (backupData.financeRecords) setFinanceRecords(backupData.financeRecords);
    if (backupData.savings) setSavings(backupData.savings);
    if (backupData.budgets) setBudgets(backupData.budgets);
    if (backupData.routines) setRoutines(backupData.routines);
    if (backupData.prayers) setPrayers(backupData.prayers);
    if (backupData.goals) setGoals(backupData.goals);
    if (backupData.trips) setTrips(backupData.trips);
    if (backupData.workouts) setWorkouts(backupData.workouts);
    if (backupData.normalNotes) setNormalNotes(backupData.normalNotes);
    if (backupData.igNotes) setIgNotes(backupData.igNotes);
    if (backupData.personalNotes) setPersonalNotes(backupData.personalNotes);
  };

  const allAppData = {
    items,
    wishlist,
    budgetPos,
    dailyIncomes,
    financeRecords,
    savings,
    budgets,
    routines,
    prayers,
    goals,
    trips,
    workouts,
    normalNotes,
    igNotes,
    personalNotes,
  };

  return (
    <div className="min-h-screen bg-[#FFFDF6] text-slate-900 flex flex-col font-sans selection:bg-[#FFD000] selection:text-black overflow-x-hidden">
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'finance') setFinanceInitialTab('transaksi');
          setCurrentView(view);
        }}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenChatGPT={() => setShowChatGPTModal(true)}
        onOpenGoogleSheets={() => setShowGoogleSheetsModal(true)}
      />

      <main className="flex-1 pb-12 sm:pb-16">
        {currentView === 'hub' && (
          <HubDashboard
            items={items}
            financeRecords={financeRecords}
            routines={routines}
            prayers={prayers}
            notes={normalNotes}
            onNavigate={setCurrentView}
            onOpenChatGPT={() => setShowChatGPTModal(true)}
            onOpenGoogleSheets={() => setShowGoogleSheetsModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
          />
        )}

        {currentView === 'kosman' && (
          <KosManView
            items={items}
            wishlist={wishlist}
            budgetPos={budgetPos}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddWishlistItem={handleAddWishlistItem}
            onToggleWishlistPurchased={handleToggleWishlistPurchased}
            onDeleteWishlistItem={handleDeleteWishlistItem}
            onPullLowStockToWishlist={handlePullLowStockToWishlist}
            onQuickPayKosUtility={handleQuickPayKosUtility}
            onNavigateFinanceSim={() => {
              setFinanceInitialTab('simulasi');
              setCurrentView('finance');
            }}
            onOpenChatGPT={() => setShowChatGPTModal(true)}
            onOpenGoogleSheets={() => setShowGoogleSheetsModal(true)}
          />
        )}

        {currentView === 'finance' && (
          <FinanceView
            records={financeRecords}
            savings={savings}
            budgets={budgets}
            kosItems={items}
            budgetPos={budgetPos}
            dailyIncomes={dailyIncomes}
            initialTab={financeInitialTab}
            onAddRecord={handleAddFinanceRecord}
            onDeleteRecord={handleDeleteFinanceRecord}
            onAddSaving={handleAddSaving}
            onUpdateSaving={handleUpdateSaving}
            onDeleteSaving={handleDeleteSaving}
            onUpdateBudgetPos={setBudgetPos}
            onAddDailyIncome={handleAddDailyIncome}
            onDeleteDailyIncome={handleDeleteDailyIncome}
            onImportOcrItems={handleImportOcrItems}
            onOpenGoogleSheets={() => setShowGoogleSheetsModal(true)}
          />
        )}

        {currentView === 'activities' && (
          <ActivitiesView
            routines={routines}
            goals={goals}
            trips={trips}
            workouts={workouts}
            onToggleRoutine={handleToggleRoutine}
            onAddRoutine={handleAddRoutine}
            onDeleteRoutine={handleDeleteRoutine}
            onToggleGoal={handleToggleGoal}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
            onAddTrip={handleAddTrip}
            onAddWorkout={handleAddWorkout}
            onAddFinanceRecord={handleAddFinanceRecord}
          />
        )}

        {currentView === 'notes' && (
          <NotesView
            normalNotes={normalNotes}
            igNotes={igNotes}
            personalNotes={personalNotes}
            onAddNormalNote={handleAddNormalNote}
            onDeleteNormalNote={handleDeleteNormalNote}
            onAddIGNote={handleAddIGNote}
            onDeleteIGNote={handleDeleteIGNote}
            onAddPersonalNote={handleAddPersonalNote}
            onDeletePersonalNote={handleDeletePersonalNote}
          />
        )}

        {currentView === 'worship' && <WorshipView />}
      </main>

      <footer className="bg-black text-white border-t-2 sm:border-t-3 border-black py-4 sm:py-5 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs font-bold">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#FF4B82] text-white border border-white rounded flex items-center justify-center font-black text-xs">
              M!
            </div>
            <span>ManageMe! — Solusi Manajemen Terpusat (Pop Comic Edition)</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-slate-400 flex-wrap justify-center">
            <button onClick={() => setCurrentView('hub')} className="hover:text-white transition-colors">Hub</button>
            <span>·</span>
            <button onClick={() => setCurrentView('kosman')} className="hover:text-white transition-colors">KosMan</button>
            <span>·</span>
            <button onClick={() => setCurrentView('finance')} className="hover:text-white transition-colors">Keuangan</button>
            <span>·</span>
            <button onClick={() => setCurrentView('activities')} className="hover:text-white transition-colors">Kegiatan</button>
            <span>·</span>
            <button onClick={() => setCurrentView('notes')} className="hover:text-white transition-colors">Catatan</button>
            <span>·</span>
            <button onClick={() => setCurrentView('worship')} className="hover:text-white transition-colors">Waktu Ibadah</button>
            <span>·</span>
            <button onClick={() => setShowSettingsModal(true)} className="hover:text-white transition-colors">Pengaturan & Versi</button>
          </div>
        </div>
      </footer>

      <OfflineIndicator />

      <ChatGPTModal
        isOpen={showChatGPTModal}
        onClose={() => setShowChatGPTModal(false)}
        items={items}
        onImportParsedItems={handleImportParsedChatGPTItems}
        onImportParsedWishlist={handleImportParsedChatGPTWishlist}
      />

      <GoogleSheetsModal
        isOpen={showGoogleSheetsModal}
        onClose={() => setShowGoogleSheetsModal(false)}
        items={items}
        wishlist={wishlist}
        financeRecords={financeRecords}
        budgetPos={budgetPos}
        onUpdateAllItems={setItems}
        onSyncPullSuccess={handleSyncPullSuccess}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        versions={versions}
        onUpdateVersions={setVersions}
        onResetAllData={handleResetAllData}
        allAppData={allAppData}
        onImportAllData={handleImportAllData}
      />
    </div>
  );
}
