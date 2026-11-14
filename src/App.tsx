import React, { useState, useEffect } from 'react';
import {
  KosItem,
  KosCategory,
  PurchaseHistoryEntry,
  FinanceRecord,
  SavingGoal,
  WishlistItem,
  BudgetPos,
  BudgetConfig,
  DailyIncomeEntry,
  RoutineActivity,
  MissedPrayer,
  DailyGoal,
  TripLog,
  WorkoutLog,
  NormalNote,
  IGNote,
  PersonalNote,
  AppVersionState,
  WorshipPref,
} from './types/kosman';
import { INITIAL_KOS_ITEMS, normalizeKosCategory } from './data/kosmanItems';
import {
  INITIAL_APP_VERSIONS,
  INITIAL_FINANCE_RECORDS,
  INITIAL_SAVING_GOALS,
  INITIAL_WISHLIST_ITEMS,
  INITIAL_BUDGET_POS,
  INITIAL_BUDGET_CONFIG,
  INITIAL_DAILY_INCOMES,
  INITIAL_ROUTINE_ACTIVITIES,
  INITIAL_MISSED_PRAYERS,
  INITIAL_DAILY_GOALS,
  INITIAL_WORKOUT_LOGS,
  INITIAL_TRIP_LOGS,
  INITIAL_NORMAL_NOTES,
  INITIAL_IG_NOTES,
  INITIAL_PERSONAL_NOTES,
  INITIAL_WORSHIP_PREF,
} from './data/initialAppData';

import { Navbar, ActiveAppView } from './components/Navbar';
import { HubDashboard } from './components/HubDashboard';
import { KosManView } from './components/KosManView';
import { FinanceView } from './components/FinanceView';
import { ActivitiesView } from './components/ActivitiesView';
import { NotesView } from './components/NotesView';
import { WorshipView } from './components/WorshipView';
import { ChatGPTModal } from './components/ChatGPTModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/PWAInstallBanner';
import { OcrExtractedItem, ScannedStockItem } from './components/InlineUI';
import {
  FullSpreadsheetPayload,
  OAUTH_RETURN_PANEL_KEY,
  autoSyncKosmanFullToSheets,
  autoSyncWishlistFullToSheets,
  autoSyncFinanceFullToSheets,
  autoSyncBudgetFullToSheets,
  autoSyncActivitiesFullToSheets,
  autoSyncNotesFullToSheets,
  autoSyncWorshipToSheets,
} from './services/googleSheetsAutoSync';

// One-time migration for v2.4.0 clean empty KosMan base
const V24_CLEAN_KOSMAN_KEY = 'manageme_v24_zero_kosman_applied';
if (typeof window !== 'undefined' && !localStorage.getItem(V24_CLEAN_KOSMAN_KEY)) {
  localStorage.removeItem('manageme_kosman_items');
  localStorage.removeItem('manageme_wishlist_items');
  localStorage.setItem(V24_CLEAN_KOSMAN_KEY, 'true');
}

const getNowDateAndTime = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return { date, time, dateTime: `${date} ${time}` };
};

const getIndonesianDayName = (dateStr: string): string => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const parsed = new Date(dateStr + 'T00:00:00');
  return isNaN(parsed.getTime()) ? 'Senin' : days[parsed.getDay()];
};

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveAppView>('hub');
  const [financeInitialTab, setFinanceInitialTab] = useState<'transaksi' | 'budget' | 'tabungan'>('transaksi');

  // Pop-up utility panel state (auto-open Set Spreadsheet if returning from OAuth redirect)
  const [activeUtilityPanel, setActiveUtilityPanel] = useState<'none' | 'chatgpt' | 'sheets' | 'settings'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(OAUTH_RETURN_PANEL_KEY) === 'sheets') {
      localStorage.removeItem(OAUTH_RETURN_PANEL_KEY);
      return 'sheets';
    }
    return 'none';
  });

  const toggleUtilityPanel = (panel: 'chatgpt' | 'sheets' | 'settings') => {
    setActiveUtilityPanel((prev) => (prev === panel ? 'none' : panel));
  };

  // App Versions state (updated in SettingsModal only)
  const [versions, setVersions] = useState<AppVersionState>(() => {
    const saved = localStorage.getItem('manageme_app_versions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const releaseVer = INITIAL_APP_VERSIONS.hub;
        return {
          hub: releaseVer,
          kosman: parsed.kosman && parsed.kosman >= releaseVer ? parsed.kosman : releaseVer,
          finance: parsed.finance && parsed.finance >= releaseVer ? parsed.finance : releaseVer,
          activities: parsed.activities && parsed.activities >= releaseVer ? parsed.activities : releaseVer,
          notes: parsed.notes && parsed.notes >= releaseVer ? parsed.notes : releaseVer,
          worship: parsed.worship && parsed.worship >= releaseVer ? parsed.worship : releaseVer,
        };
      } catch {
        // ignore
      }
    }
    return INITIAL_APP_VERSIONS;
  });

  // KosMan Items Dataset State (starts empty [] on fresh base)
  const [items, setItems] = useState<KosItem[]>(() => {
    const saved = localStorage.getItem('manageme_kosman_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((it: any) => {
            const normCat = normalizeKosCategory(it.category);
            const normTags: KosCategory[] =
              Array.isArray(it.tags) && it.tags.length > 0
                ? Array.from(new Set(it.tags.map(normalizeKosCategory)))
                : [normCat];
            return {
              ...it,
              category: normCat,
              tags: normTags,
              purchaseHistory: Array.isArray(it.purchaseHistory) ? it.purchaseHistory : [],
            };
          });
        }
      } catch (err) {
        console.error('Failed to parse saved kosman items:', err);
      }
    }
    return INITIAL_KOS_ITEMS;
  });

  // Wishlist State
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

  // Budget Pos & Simplified Ratio Config
  const [budgetPos, setBudgetPos] = useState<BudgetPos[]>(() => {
    const saved = localStorage.getItem('manageme_budget_pos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore
      }
    }
    return INITIAL_BUDGET_POS;
  });

  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>(() => {
    const saved = localStorage.getItem('manageme_budget_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return INITIAL_BUDGET_CONFIG;
  });

  const [dailyIncomes, setDailyIncomes] = useState<DailyIncomeEntry[]>(() => {
    const saved = localStorage.getItem('manageme_daily_incomes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
      }
    }
    return INITIAL_DAILY_INCOMES;
  });

  // Finance State
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>(() => {
    const saved = localStorage.getItem('manageme_finance_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
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
      } catch {
        // ignore
      }
    }
    return INITIAL_SAVING_GOALS;
  });

  // Activities State
  const [routines, setRoutines] = useState<RoutineActivity[]>(() => {
    const saved = localStorage.getItem('manageme_routines');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
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
      } catch {
        // ignore
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
      } catch {
        // ignore
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
      } catch {
        // ignore
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
      } catch {
        // ignore
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
      } catch {
        // ignore
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
      } catch {
        // ignore
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
      } catch {
        // ignore
      }
    }
    return INITIAL_PERSONAL_NOTES;
  });

  // Worship Preferences State (Synced to Waktu_Ibadah tab)
  const [worshipPref, setWorshipPref] = useState<WorshipPref>(() => {
    const saved = localStorage.getItem('manageme_worship_pref');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return INITIAL_WORSHIP_PREF;
  });

  // LocalStorage Synchronizers
  useEffect(() => { localStorage.setItem('manageme_app_versions', JSON.stringify(versions)); }, [versions]);
  useEffect(() => { localStorage.setItem('manageme_kosman_items', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('manageme_wishlist_items', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('manageme_budget_pos', JSON.stringify(budgetPos)); }, [budgetPos]);
  useEffect(() => { localStorage.setItem('manageme_budget_config', JSON.stringify(budgetConfig)); }, [budgetConfig]);
  useEffect(() => { localStorage.setItem('manageme_daily_incomes', JSON.stringify(dailyIncomes)); }, [dailyIncomes]);
  useEffect(() => { localStorage.setItem('manageme_finance_records', JSON.stringify(financeRecords)); }, [financeRecords]);
  useEffect(() => { localStorage.setItem('manageme_savings', JSON.stringify(savings)); }, [savings]);
  useEffect(() => { localStorage.setItem('manageme_routines', JSON.stringify(routines)); }, [routines]);
  useEffect(() => { localStorage.setItem('manageme_prayers', JSON.stringify(prayers)); }, [prayers]);
  useEffect(() => { localStorage.setItem('manageme_daily_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('manageme_trips', JSON.stringify(trips)); }, [trips]);
  useEffect(() => { localStorage.setItem('manageme_workouts', JSON.stringify(workouts)); }, [workouts]);
  useEffect(() => { localStorage.setItem('manageme_normal_notes', JSON.stringify(normalNotes)); }, [normalNotes]);
  useEffect(() => { localStorage.setItem('manageme_ig_notes', JSON.stringify(igNotes)); }, [igNotes]);
  useEffect(() => { localStorage.setItem('manageme_personal_notes', JSON.stringify(personalNotes)); }, [personalNotes]);
  useEffect(() => { localStorage.setItem('manageme_worship_pref', JSON.stringify(worshipPref)); }, [worshipPref]);

  // --- KOSMAN HANDLERS (Total-Price Purchase Model & Timestamped History) ---
  const handleAddItem = (newItemData: Omit<KosItem, 'id' | 'totalSpend'>, initialTotalPaid?: number) => {
    const { date, time, dateTime } = getNowDateAndTime();
    const paid = Number(initialTotalPaid) || 0;
    const initialHistory: PurchaseHistoryEntry[] =
      paid > 0 || newItemData.quantity > 0
        ? [
            {
              id: 'hist-' + Date.now(),
              purchasedAt: dateTime,
              quantity: Math.max(1, newItemData.quantity),
              totalPrice: paid,
              account: 'Kas',
              note: paid > 0 ? 'Pembelian awal saat input item' : 'Input stok awal',
            },
          ]
        : [];

    const newItem: KosItem = {
      ...newItemData,
      id: 'item-' + Date.now(),
      price: paid > 0 && newItemData.quantity > 0 ? Math.round(paid / newItemData.quantity) : 0,
      timesPurchased: paid > 0 ? 1 : newItemData.timesPurchased || 0,
      totalSpend: paid,
      lastPurchasedDate: dateTime,
      purchaseHistory: initialHistory,
    };

    const nextItems = [newItem, ...items];
    setItems(nextItems);
    autoSyncKosmanFullToSheets(nextItems);

    if (paid > 0) {
      const finRec: FinanceRecord = {
        id: 'fin-init-' + Date.now(),
        type: 'expense',
        amount: paid,
        category: newItem.category,
        subCategory: newItem.subCategory,
        note: `Beli ${newItem.name} (${newItem.quantity} ${newItem.unit})`,
        account: 'Kas',
        date,
        time,
        source: 'kosman',
        createdAt: Date.now(),
      };
      const nextFin = [finRec, ...financeRecords];
      setFinanceRecords(nextFin);
      autoSyncFinanceFullToSheets(nextFin);
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<KosItem>) => {
    const nextItems = items.map((item) => (item.id === id ? { ...item, ...updates } : item));
    setItems(nextItems);
    autoSyncKosmanFullToSheets(nextItems);
  };

  const handleRecordItemPurchase = (
    id: string,
    qtyBought: number,
    totalPrice: number,
    account: 'Kas' | 'Bank' | 'E-Wallet',
    note: string
  ) => {
    const { date, time, dateTime } = getNowDateAndTime();
    const target = items.find((i) => i.id === id);
    if (!target) return;

    const entry: PurchaseHistoryEntry = {
      id: 'hist-' + Date.now(),
      purchasedAt: dateTime,
      quantity: Math.max(1, qtyBought),
      totalPrice: Math.max(0, totalPrice),
      account,
      note: note.trim() || undefined,
    };

    const nextItems = items.map((item) => {
      if (item.id !== id) return item;
      const updatedHistory = [entry, ...(item.purchaseHistory || [])];
      return {
        ...item,
        quantity: item.quantity + entry.quantity,
        timesPurchased: (item.timesPurchased || 0) + 1,
        totalSpend: (item.totalSpend || 0) + entry.totalPrice,
        price: entry.quantity > 0 && entry.totalPrice > 0 ? Math.round(entry.totalPrice / entry.quantity) : item.price,
        lastPurchasedDate: dateTime,
        purchaseHistory: updatedHistory,
      };
    });

    setItems(nextItems);
    autoSyncKosmanFullToSheets(nextItems);

    if (entry.totalPrice > 0) {
      const finRec: FinanceRecord = {
        id: 'fin-buy-' + Date.now(),
        type: 'expense',
        amount: entry.totalPrice,
        category: target.category,
        subCategory: target.subCategory,
        note: `Beli ${target.name} (${entry.quantity} ${target.unit})${note ? ` - ${note}` : ''}`,
        account,
        date,
        time,
        source: 'kosman',
        createdAt: Date.now(),
      };
      const nextFin = [finRec, ...financeRecords];
      setFinanceRecords(nextFin);
      autoSyncFinanceFullToSheets(nextFin);
    }
  };

  const handleDeleteItem = (id: string) => {
    const nextItems = items.filter((i) => i.id !== id);
    setItems(nextItems);
    autoSyncKosmanFullToSheets(nextItems);
  };

  // --- WISHLIST HANDLERS (Batch Add + Bulk Delete) ---
  const handleAddWishlistBatch = (
    itemsToAdd: Omit<WishlistItem, 'id' | 'createdAt' | 'purchased'>[]
  ) => {
    const now = Date.now();
    const created: WishlistItem[] = itemsToAdd.map((w, idx) => ({
      ...w,
      id: `wish-${now}-${idx}-${Math.floor(Math.random() * 1000)}`,
      purchased: false,
      createdAt: now + idx,
    }));
    const nextWish = [...created, ...wishlist];
    setWishlist(nextWish);
    autoSyncWishlistFullToSheets(nextWish);
  };

  const handleToggleWishlistPurchased = (id: string, alsoLogFinance: boolean) => {
    const target = wishlist.find((w) => w.id === id);
    if (!target) return;

    const nowPurchased = !target.purchased;
    const nextWish = wishlist.map((w) => (w.id === id ? { ...w, purchased: nowPurchased } : w));
    setWishlist(nextWish);
    autoSyncWishlistFullToSheets(nextWish);

    if (nowPurchased) {
      const { date, time, dateTime } = getNowDateAndTime();
      const totalEstimated = target.estimatedPrice || 0;
      const entry: PurchaseHistoryEntry = {
        id: 'hist-wish-' + Date.now(),
        purchasedAt: dateTime,
        quantity: Math.max(1, target.quantity),
        totalPrice: totalEstimated,
        account: 'Kas',
        note: 'Dibeli dari Wishlist',
      };

      let matched = false;
      const nextItems = items.map((it) => {
        if (it.id === target.linkedKosItemId || it.name.toLowerCase() === target.name.toLowerCase()) {
          matched = true;
          return {
            ...it,
            quantity: it.quantity + target.quantity,
            timesPurchased: (it.timesPurchased || 0) + 1,
            totalSpend: (it.totalSpend || 0) + totalEstimated,
            lastPurchasedDate: dateTime,
            purchaseHistory: [entry, ...(it.purchaseHistory || [])],
          };
        }
        return it;
      });

      const finalItems = matched
        ? nextItems
        : [
            {
              id: 'item-wish-' + Date.now(),
              name: target.name,
              category: target.shoppingCategory,
              tags: [target.shoppingCategory, 'Belanja'] as KosCategory[],
              subCategory: target.subCategory || 'Belanja Mingguan',
              quantity: target.quantity,
              unit: target.unit,
              price: target.quantity > 0 ? Math.round(totalEstimated / target.quantity) : 0,
              timesPurchased: 1,
              totalSpend: totalEstimated,
              minThreshold: 1,
              lastPurchasedDate: dateTime,
              purchaseHistory: [entry],
            },
            ...nextItems,
          ];

      setItems(finalItems);
      autoSyncKosmanFullToSheets(finalItems);

      if (alsoLogFinance && totalEstimated > 0) {
        const finRec: FinanceRecord = {
          id: 'fin-wish-' + Date.now(),
          type: 'expense',
          amount: totalEstimated,
          category: target.shoppingCategory,
          subCategory: target.subCategory,
          note: `Beli Wishlist: ${target.name} (${target.quantity} ${target.unit})`,
          account: 'Kas',
          date,
          time,
          source: 'wishlist',
          createdAt: Date.now(),
        };
        const nextFin = [finRec, ...financeRecords];
        setFinanceRecords(nextFin);
        autoSyncFinanceFullToSheets(nextFin);
      }
    }
  };

  const handleBulkDeleteWishlist = (ids: string[]) => {
    const idSet = new Set(ids);
    const nextWish = wishlist.filter((w) => !idSet.has(w.id));
    setWishlist(nextWish);
    autoSyncWishlistFullToSheets(nextWish);
  };

  const handlePullLowStockToWishlist = (): number => {
    const lowOrEmpty = items.filter((i) => i.quantity <= i.minThreshold);
    const existingPendingNames = new Set(
      wishlist.filter((w) => !w.purchased).map((w) => w.name.toLowerCase())
    );
    const additions: WishlistItem[] = lowOrEmpty
      .filter((i) => !existingPendingNames.has(i.name.toLowerCase()))
      .map((i, idx) => ({
        id: `wish-low-${Date.now()}-${idx}`,
        name: i.name,
        shoppingCategory: i.category,
        subCategory: i.subCategory,
        quantity: 1,
        unit: i.unit,
        estimatedPrice: i.price || 0,
        priority: i.quantity === 0 ? 'Wajib' : 'Sedang',
        purchased: false,
        linkedKosItemId: i.id,
        source: 'low-stock',
        createdAt: Date.now() + idx,
      }));

    if (additions.length > 0) {
      const nextWish = [...additions, ...wishlist];
      setWishlist(nextWish);
      autoSyncWishlistFullToSheets(nextWish);
    }
    return additions.length;
  };

  const handleQuickPayKosUtility = (item: KosItem, totalAmount: number) => {
    const { date, time, dateTime } = getNowDateAndTime();
    const paid = Math.max(0, totalAmount);

    const entry: PurchaseHistoryEntry = {
      id: 'hist-kos-' + Date.now(),
      purchasedAt: dateTime,
      quantity: 1,
      totalPrice: paid,
      account: 'Kas',
      note: 'Pembayaran Pos Kos / Listrik',
    };

    const nextItems = items.map((it) =>
      it.id === item.id
        ? {
            ...it,
            timesPurchased: (it.timesPurchased || 0) + 1,
            totalSpend: (it.totalSpend || 0) + paid,
            lastPurchasedDate: dateTime,
            purchaseHistory: [entry, ...(it.purchaseHistory || [])],
          }
        : it
    );
    setItems(nextItems);
    autoSyncKosmanFullToSheets(nextItems);

    if (paid > 0) {
      const finRec: FinanceRecord = {
        id: 'fin-kos-' + Date.now(),
        type: 'expense',
        amount: paid,
        category: 'Kelistrikan & Kos',
        subCategory: item.subCategory,
        note: `Bayar Pos Kos: ${item.name}`,
        account: 'Kas',
        date,
        time,
        source: 'kosman',
        createdAt: Date.now(),
      };
      const nextFin = [finRec, ...financeRecords];
      setFinanceRecords(nextFin);
      autoSyncFinanceFullToSheets(nextFin);
    }
  };

  // --- UNIFIED AI SCAN HANDLERS (Scan Nota & Scan Stok available in KosMan + Keuangan) ---
  const handleApplyNotaResult = (payload: {
    storeName: string;
    totalAmount: number;
    date: string;
    time: string;
    category: string;
    note: string;
    items: OcrExtractedItem[];
    alsoUpdateKosMan: boolean;
    account: 'Kas' | 'Bank' | 'E-Wallet';
  }) => {
    const dateTime = `${payload.date} ${payload.time || '12:00'}`;
    const finRec: FinanceRecord = {
      id: 'fin-ocr-' + Date.now(),
      type: 'expense',
      amount: Math.max(0, payload.totalAmount),
      category: payload.category || 'Belanja KosMan',
      subCategory: payload.storeName,
      note: payload.note || `Struk ${payload.storeName}`,
      account: payload.account || 'Kas',
      date: payload.date,
      time: payload.time || '12:00',
      source: 'ocr',
      createdAt: Date.now(),
    };
    const nextFin = [finRec, ...financeRecords];
    setFinanceRecords(nextFin);
    autoSyncFinanceFullToSheets(nextFin);

    if (payload.alsoUpdateKosMan && payload.items.length > 0) {
      const updatedList = [...items];
      payload.items.forEach((ocrIt, idx) => {
        if (!ocrIt.name) return;
        const foundIdx = updatedList.findIndex(
          (i) => i.name.toLowerCase() === ocrIt.name.toLowerCase()
        );
        const qty = Math.max(1, Number(ocrIt.quantity) || 1);
        const totalLine = Number(ocrIt.price) || 0;
        const histEntry: PurchaseHistoryEntry = {
          id: `hist-ocr-${Date.now()}-${idx}`,
          purchasedAt: dateTime,
          quantity: qty,
          totalPrice: totalLine,
          account: payload.account || 'Kas',
          note: `Scan Nota: ${payload.storeName}`,
        };

        if (foundIdx >= 0) {
          const cur = updatedList[foundIdx];
          updatedList[foundIdx] = {
            ...cur,
            quantity: cur.quantity + qty,
            timesPurchased: (cur.timesPurchased || 0) + 1,
            totalSpend: (cur.totalSpend || 0) + totalLine,
            lastPurchasedDate: dateTime,
            purchaseHistory: [histEntry, ...(cur.purchaseHistory || [])],
          };
        } else {
          const cat = normalizeKosCategory(ocrIt.suggestedCategory || 'Belanja');
          updatedList.unshift({
            id: `ocr-item-${Date.now()}-${idx}`,
            name: ocrIt.name,
            category: cat,
            tags: [cat, 'Belanja'],
            subCategory: 'Belanja Nota',
            quantity: qty,
            unit: ocrIt.unit || 'buah',
            price: qty > 0 && totalLine > 0 ? Math.round(totalLine / qty) : 0,
            timesPurchased: 1,
            totalSpend: totalLine,
            minThreshold: 1,
            lastPurchasedDate: dateTime,
            notes: `Scan Nota ${payload.storeName}`,
            purchaseHistory: [histEntry],
          });
        }
      });
      setItems(updatedList);
      autoSyncKosmanFullToSheets(updatedList);
    }
  };

  const handleApplyStockScanResult = (detectedItems: ScannedStockItem[]) => {
    const { dateTime } = getNowDateAndTime();
    const updatedList = [...items];

    detectedItems.forEach((det, idx) => {
      if (!det.name.trim()) return;
      const foundIdx = updatedList.findIndex(
        (i) => i.name.toLowerCase() === det.name.trim().toLowerCase()
      );
      const qty = Math.max(0, Number(det.quantity) || 0);
      const cat = normalizeKosCategory(det.category || 'Makanan');

      if (foundIdx >= 0) {
        updatedList[foundIdx] = {
          ...updatedList[foundIdx],
          quantity: qty,
          unit: det.unit || updatedList[foundIdx].unit,
          notes: `Stok dicek via Scan AI (${dateTime})`,
        };
      } else {
        updatedList.unshift({
          id: `scan-stock-${Date.now()}-${idx}`,
          name: det.name.trim(),
          category: cat,
          tags: [cat],
          subCategory: det.subCategory || 'Umum',
          quantity: qty,
          unit: det.unit || 'buah',
          price: 0,
          timesPurchased: 0,
          totalSpend: 0,
          minThreshold: 1,
          lastPurchasedDate: dateTime,
          notes: `Ditambahkan via Scan Foto Stok (${dateTime})`,
          purchaseHistory: [],
        });
      }
    });

    setItems(updatedList);
    autoSyncKosmanFullToSheets(updatedList);
  };

  // --- FINANCE & SIMPLIFIED BUDGET HANDLERS ---
  const handleAddFinanceRecord = (newRec: Omit<FinanceRecord, 'id' | 'createdAt'>) => {
    const { time } = getNowDateAndTime();
    const record: FinanceRecord = {
      ...newRec,
      id: 'fin-' + Date.now(),
      time: newRec.time || time,
      createdAt: Date.now(),
    };
    const nextFin = [record, ...financeRecords];
    setFinanceRecords(nextFin);
    autoSyncFinanceFullToSheets(nextFin);
  };

  const handleDeleteFinanceRecord = (id: string) => {
    const nextFin = financeRecords.filter((r) => r.id !== id);
    setFinanceRecords(nextFin);
    autoSyncFinanceFullToSheets(nextFin);
  };

  const handleAddDailyIncome = (
    entry: Omit<DailyIncomeEntry, 'id' | 'dayName'>,
    account: 'Kas' | 'Bank' | 'E-Wallet'
  ) => {
    const dayName = getIndonesianDayName(entry.date);
    const { time } = getNowDateAndTime();
    const newEntry: DailyIncomeEntry = {
      ...entry,
      id: 'inc-' + Date.now(),
      dayName,
    };
    setDailyIncomes((prev) => [newEntry, ...prev]);

    const finRec: FinanceRecord = {
      id: 'fin-inc-' + Date.now(),
      type: 'income',
      amount: entry.amount,
      category: 'Gaji / Kiriman',
      subCategory: dayName,
      note: `${entry.note} (${dayName})`,
      account,
      date: entry.date,
      time,
      source: 'app',
      createdAt: Date.now(),
    };
    const nextFin = [finRec, ...financeRecords];
    setFinanceRecords(nextFin);
    autoSyncFinanceFullToSheets(nextFin);
  };

  const handleDeleteDailyIncome = (id: string) => {
    setDailyIncomes((prev) => prev.filter((d) => d.id !== id));
  };

  const handleUpdateBudgetPos = (newPos: BudgetPos[]) => {
    setBudgetPos(newPos);
    autoSyncBudgetFullToSheets(newPos, budgetConfig);
  };

  const handleUpdateBudgetConfig = (newConfig: BudgetConfig) => {
    setBudgetConfig(newConfig);
    autoSyncBudgetFullToSheets(budgetPos, newConfig);
  };

  const handleAddSaving = (newSaving: Omit<SavingGoal, 'id'>) => {
    setSavings((prev) => [...prev, { ...newSaving, id: 'save-' + Date.now() }]);
  };

  const handleUpdateSaving = (id: string, currentAmount: number) => {
    setSavings((prev) => prev.map((s) => (s.id === id ? { ...s, currentAmount } : s)));
  };

  const handleDeleteSaving = (id: string) => {
    setSavings((prev) => prev.filter((s) => s.id !== id));
  };

  // --- ACTIVITIES & NOTES & WORSHIP HANDLERS (ALL AUTO-SYNC TO SHEETS) ---
  const handleToggleRoutine = (id: string) => {
    const next = routines.map((r) => (r.id === id ? { ...r, completedToday: !r.completedToday } : r));
    setRoutines(next);
    autoSyncActivitiesFullToSheets(next, prayers, goals, trips, workouts);
  };
  const handleAddRoutine = (name: string, category: string) => {
    const next = [...routines, { id: 'act-' + Date.now(), name, category, completedToday: false }];
    setRoutines(next);
    autoSyncActivitiesFullToSheets(next, prayers, goals, trips, workouts);
  };
  const handleDeleteRoutine = (id: string) => {
    const next = routines.filter((r) => r.id !== id);
    setRoutines(next);
    autoSyncActivitiesFullToSheets(next, prayers, goals, trips, workouts);
  };

  const handleToggleGoal = (id: string) => {
    const next = goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g));
    setGoals(next);
    autoSyncActivitiesFullToSheets(routines, prayers, next, trips, workouts);
  };
  const handleAddGoal = (text: string, category: string) => {
    const next = [...goals, { id: 'dg-' + Date.now(), text, category, completed: false }];
    setGoals(next);
    autoSyncActivitiesFullToSheets(routines, prayers, next, trips, workouts);
  };
  const handleDeleteGoal = (id: string) => {
    const next = goals.filter((g) => g.id !== id);
    setGoals(next);
    autoSyncActivitiesFullToSheets(routines, prayers, next, trips, workouts);
  };

  const handleAddTrip = (trip: Omit<TripLog, 'id'>) => {
    const next = [{ ...trip, id: 'trip-' + Date.now() }, ...trips];
    setTrips(next);
    autoSyncActivitiesFullToSheets(routines, prayers, goals, next, workouts);
  };

  const handleAddWorkout = (workout: Omit<WorkoutLog, 'id'>) => {
    const next = [{ ...workout, id: 'wo-' + Date.now() }, ...workouts];
    setWorkouts(next);
    autoSyncActivitiesFullToSheets(routines, prayers, goals, trips, next);
  };

  const handleAddNormalNote = (title: string, content: string, category: string) => {
    const next = [{ id: 'nn-' + Date.now(), title, content, category, updatedAt: Date.now() }, ...normalNotes];
    setNormalNotes(next);
    autoSyncNotesFullToSheets(next, igNotes, personalNotes);
  };
  const handleDeleteNormalNote = (id: string) => {
    const next = normalNotes.filter((n) => n.id !== id);
    setNormalNotes(next);
    autoSyncNotesFullToSheets(next, igNotes, personalNotes);
  };
  const handleAddIGNote = (songTitle: string, content: string) => {
    const next = [
      {
        id: 'ign-' + Date.now(),
        songTitle,
        owner: 'ManageMe',
        content,
        backgroundColor: '#18181b',
        updatedAt: Date.now(),
      },
      ...igNotes,
    ];
    setIgNotes(next);
    autoSyncNotesFullToSheets(normalNotes, next, personalNotes);
  };
  const handleDeleteIGNote = (id: string) => {
    const next = igNotes.filter((n) => n.id !== id);
    setIgNotes(next);
    autoSyncNotesFullToSheets(normalNotes, next, personalNotes);
  };
  const handleAddPersonalNote = (
    personName: string,
    extraNotes: string,
    customFields: { key: string; value: string }[]
  ) => {
    const next = [
      { id: 'pn-' + Date.now(), personName, extraNotes, customFields, updatedAt: Date.now() },
      ...personalNotes,
    ];
    setPersonalNotes(next);
    autoSyncNotesFullToSheets(normalNotes, igNotes, next);
  };
  const handleDeletePersonalNote = (id: string) => {
    const next = personalNotes.filter((n) => n.id !== id);
    setPersonalNotes(next);
    autoSyncNotesFullToSheets(normalNotes, igNotes, next);
  };

  const handleUpdateWorshipPref = (pref: WorshipPref) => {
    setWorshipPref(pref);
    autoSyncWorshipToSheets(pref);
  };

  // --- 2-WAY GOOGLE SHEETS HYDRATOR ---
  const handleSyncPullSuccess = (pulled: Partial<FullSpreadsheetPayload>) => {
    if (pulled.items) setItems(pulled.items);
    if (pulled.wishlist) setWishlist(pulled.wishlist);
    if (pulled.financeRecords) setFinanceRecords(pulled.financeRecords);
    if (pulled.budgetPos && pulled.budgetPos.length > 0) setBudgetPos(pulled.budgetPos);
    if (pulled.budgetConfig) setBudgetConfig(pulled.budgetConfig);
    if (pulled.routines) setRoutines(pulled.routines);
    if (pulled.prayers) setPrayers(pulled.prayers);
    if (pulled.goals) setGoals(pulled.goals);
    if (pulled.trips) setTrips(pulled.trips);
    if (pulled.workouts) setWorkouts(pulled.workouts);
    if (pulled.normalNotes) setNormalNotes(pulled.normalNotes);
    if (pulled.igNotes) setIgNotes(pulled.igNotes);
    if (pulled.personalNotes) setPersonalNotes(pulled.personalNotes);
    if (pulled.worshipPref) setWorshipPref(pulled.worshipPref);
  };

  // --- RESET & BACKUP ---
  const handleResetAllData = () => {
    setItems(INITIAL_KOS_ITEMS);
    setWishlist(INITIAL_WISHLIST_ITEMS);
    setBudgetPos(INITIAL_BUDGET_POS);
    setBudgetConfig(INITIAL_BUDGET_CONFIG);
    setDailyIncomes(INITIAL_DAILY_INCOMES);
    setFinanceRecords(INITIAL_FINANCE_RECORDS);
    setSavings(INITIAL_SAVING_GOALS);
    setRoutines(INITIAL_ROUTINE_ACTIVITIES);
    setPrayers(INITIAL_MISSED_PRAYERS);
    setGoals(INITIAL_DAILY_GOALS);
    setTrips(INITIAL_TRIP_LOGS);
    setWorkouts(INITIAL_WORKOUT_LOGS);
    setNormalNotes(INITIAL_NORMAL_NOTES);
    setIgNotes(INITIAL_IG_NOTES);
    setPersonalNotes(INITIAL_PERSONAL_NOTES);
    setWorshipPref(INITIAL_WORSHIP_PREF);
    setVersions(INITIAL_APP_VERSIONS);
    localStorage.clear();
    localStorage.setItem(V24_CLEAN_KOSMAN_KEY, 'true');
  };

  const handleImportAllData = (backupData: any) => {
    if (backupData.items) setItems(backupData.items);
    if (backupData.wishlist) setWishlist(backupData.wishlist);
    if (backupData.budgetPos) setBudgetPos(backupData.budgetPos);
    if (backupData.budgetConfig) setBudgetConfig(backupData.budgetConfig);
    if (backupData.dailyIncomes) setDailyIncomes(backupData.dailyIncomes);
    if (backupData.financeRecords) setFinanceRecords(backupData.financeRecords);
    if (backupData.savings) setSavings(backupData.savings);
    if (backupData.routines) setRoutines(backupData.routines);
    if (backupData.prayers) setPrayers(backupData.prayers);
    if (backupData.goals) setGoals(backupData.goals);
    if (backupData.trips) setTrips(backupData.trips);
    if (backupData.workouts) setWorkouts(backupData.workouts);
    if (backupData.normalNotes) setNormalNotes(backupData.normalNotes);
    if (backupData.igNotes) setIgNotes(backupData.igNotes);
    if (backupData.personalNotes) setPersonalNotes(backupData.personalNotes);
    if (backupData.worshipPref) setWorshipPref(backupData.worshipPref);
  };

  const fullPayload: FullSpreadsheetPayload = {
    items,
    wishlist,
    financeRecords,
    budgetPos,
    budgetConfig,
    routines,
    prayers,
    goals,
    trips,
    workouts,
    normalNotes,
    igNotes,
    personalNotes,
    worshipPref,
  };

  const allAppData = {
    ...fullPayload,
    dailyIncomes,
    savings,
  };

  return (
    <div className="min-h-screen bg-[#FFFDF6] text-slate-900 flex flex-col font-sans selection:bg-[#FFD000] selection:text-black overflow-x-hidden">
      <Navbar
        currentView={currentView}
        activeUtilityPanel={activeUtilityPanel}
        onNavigate={(view) => {
          if (view === 'finance') setFinanceInitialTab('transaksi');
          setCurrentView(view);
        }}
        onToggleUtilityPanel={toggleUtilityPanel}
      />

      <main className="flex-1 pb-12 sm:pb-16">
        <OfflineIndicator />

        {/* Inline Expandable Utility Panels (Zero Pop-ups) */}
        <ChatGPTModal
          isOpen={activeUtilityPanel === 'chatgpt'}
          onClose={() => setActiveUtilityPanel('none')}
          onOpenGoogleSheets={() => setActiveUtilityPanel('sheets')}
        />

        <GoogleSheetsModal
          isOpen={activeUtilityPanel === 'sheets'}
          onClose={() => setActiveUtilityPanel('none')}
          fullPayload={fullPayload}
          onSyncPullSuccess={handleSyncPullSuccess}
        />

        <SettingsModal
          isOpen={activeUtilityPanel === 'settings'}
          onClose={() => setActiveUtilityPanel('none')}
          versions={versions}
          onUpdateVersions={setVersions}
          onResetAllData={handleResetAllData}
          allAppData={allAppData}
          onImportAllData={handleImportAllData}
        />

        {currentView === 'hub' && (
          <HubDashboard
            items={items}
            financeRecords={financeRecords}
            routines={routines}
            prayers={prayers}
            notes={normalNotes}
            onNavigate={setCurrentView}
            onOpenChatGPT={() => toggleUtilityPanel('chatgpt')}
            onOpenGoogleSheets={() => toggleUtilityPanel('sheets')}
            onOpenSettings={() => toggleUtilityPanel('settings')}
          />
        )}

        {currentView === 'kosman' && (
          <KosManView
            items={items}
            wishlist={wishlist}
            budgetPos={budgetPos}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onRecordItemPurchase={handleRecordItemPurchase}
            onDeleteItem={handleDeleteItem}
            onAddWishlistBatch={handleAddWishlistBatch}
            onToggleWishlistPurchased={handleToggleWishlistPurchased}
            onBulkDeleteWishlist={handleBulkDeleteWishlist}
            onPullLowStockToWishlist={handlePullLowStockToWishlist}
            onQuickPayKosUtility={handleQuickPayKosUtility}
            onApplyNotaResult={handleApplyNotaResult}
            onApplyStockScanResult={handleApplyStockScanResult}
            onNavigateFinanceSim={() => {
              setFinanceInitialTab('budget');
              setCurrentView('finance');
            }}
            onOpenChatGPT={() => setActiveUtilityPanel('chatgpt')}
            onOpenGoogleSheets={() => setActiveUtilityPanel('sheets')}
          />
        )}

        {currentView === 'finance' && (
          <FinanceView
            records={financeRecords}
            savings={savings}
            kosItems={items}
            budgetPos={budgetPos}
            budgetConfig={budgetConfig}
            dailyIncomes={dailyIncomes}
            initialTab={financeInitialTab}
            onAddRecord={handleAddFinanceRecord}
            onDeleteRecord={handleDeleteFinanceRecord}
            onAddSaving={handleAddSaving}
            onUpdateSaving={handleUpdateSaving}
            onDeleteSaving={handleDeleteSaving}
            onUpdateBudgetPos={handleUpdateBudgetPos}
            onUpdateBudgetConfig={handleUpdateBudgetConfig}
            onAddDailyIncome={handleAddDailyIncome}
            onDeleteDailyIncome={handleDeleteDailyIncome}
            onApplyNotaResult={handleApplyNotaResult}
            onApplyStockScanResult={handleApplyStockScanResult}
            onOpenGoogleSheets={() => setActiveUtilityPanel('sheets')}
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

        {currentView === 'worship' && (
          <WorshipView worshipPref={worshipPref} onUpdateWorshipPref={handleUpdateWorshipPref} />
        )}
      </main>

      <footer className="bg-black text-white border-t-2 border-black py-3.5 sm:py-4 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] font-bold">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#FF4B82] text-white border border-white rounded flex items-center justify-center font-black text-xs">
              M!
            </div>
            <span>ManageMe! — Solusi Manajemen Kos & Keuangan Terpusat</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-slate-400 flex-wrap justify-center">
            <button type="button" onClick={() => setCurrentView('hub')} className="hover:text-white transition-colors">
              Hub
            </button>
            <span>·</span>
            <button type="button" onClick={() => setCurrentView('kosman')} className="hover:text-white transition-colors">
              KosMan
            </button>
            <span>·</span>
            <button type="button" onClick={() => setCurrentView('finance')} className="hover:text-white transition-colors">
              Keuangan
            </button>
            <span>·</span>
            <button type="button" onClick={() => setCurrentView('activities')} className="hover:text-white transition-colors">
              Kegiatan
            </button>
            <span>·</span>
            <button type="button" onClick={() => setCurrentView('notes')} className="hover:text-white transition-colors">
              Catatan
            </button>
            <span>·</span>
            <button type="button" onClick={() => setCurrentView('worship')} className="hover:text-white transition-colors">
              Waktu Ibadah
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => toggleUtilityPanel('settings')}
              className="hover:text-white transition-colors"
            >
              Pengaturan & Versi
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
