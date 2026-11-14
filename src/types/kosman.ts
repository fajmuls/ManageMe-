export type KosCategory =
  | 'Makanan'
  | 'Minuman'
  | 'Bumbu Dapur'
  | 'Kebersihan & Toilet'
  | 'Kesehatan'
  | 'Keperluan Rumah Tangga'
  | 'Kelistrikan & Kos'
  | 'Alat Tulis'
  | 'Keinginan'
  | 'Belanja';

export type StockStatus = 'AMAN' | 'LOW' | 'HABIS';

export interface PurchaseHistoryEntry {
  id: string;
  purchasedAt: string; // YYYY-MM-DD HH:mm
  quantity: number;
  totalPrice: number; // Total overall price paid for this transaction
  account: 'Kas' | 'Bank' | 'E-Wallet';
  note?: string;
}

export interface KosItem {
  id: string;
  name: string;
  category: KosCategory;
  tags?: KosCategory[];
  subCategory: string;
  quantity: number;
  unit: string;
  price: number; // Derived/latest unit estimate or 0 (transactions track totalPrice)
  timesPurchased: number;
  totalSpend: number;
  minThreshold: number;
  lastPurchasedDate?: string; // YYYY-MM-DD or YYYY-MM-DD HH:mm
  notes?: string;
  purchaseHistory?: PurchaseHistoryEntry[];
}

export type WishlistPriority = 'Wajib' | 'Sedang' | 'Keinginan';

export interface WishlistItem {
  id: string;
  name: string;
  shoppingCategory: KosCategory;
  subCategory?: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  priority: WishlistPriority;
  purchased: boolean;
  linkedKosItemId?: string;
  source: 'manual' | 'low-stock' | 'chatgpt' | 'sheets';
  notes?: string;
  createdAt: number;
}

export type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'quantity-asc'
  | 'spend-desc'
  | 'timesPurchased-desc';

// Finance & Simplified Kosan Budget Simulation Types
export interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  subCategory?: string;
  note: string;
  account: 'Kas' | 'Bank' | 'E-Wallet';
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  source?: 'app' | 'ocr' | 'chatgpt' | 'sheets' | 'wishlist' | 'kosman';
  createdAt: number;
}

export interface BudgetPos {
  id: string;
  name: string;
  weeklyTarget: number;
  allocationPercent: number;
  linkedCategories: string[];
  color: string;
}

export interface BudgetConfig {
  periodType: 'monthly' | 'weekly';
  incomeAmount: number;
}

export interface DailyIncomeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  dayName: string; // Senin..Minggu
  amount: number;
  note: string;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  location: string;
  deadline?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'Bulanan' | 'Mingguan';
}

// Daily Activities & Logs Types
export interface RoutineActivity {
  id: string;
  name: string;
  category: string;
  completedToday?: boolean;
}

export interface RoutineCompletion {
  activityId: string;
  dateStr: string;
}

export type FardhuPrayer = 'Subuh' | 'Dzuhur' | 'Ashar' | 'Maghrib' | 'Isya' | 'Belum Diketahui';

export interface MissedPrayer {
  id: string;
  prayer: FardhuPrayer;
  dateInfo: string;
  completed: boolean;
  completedAt?: number;
}

export interface DailyGoal {
  id: string;
  text: string;
  category: string;
  completed: boolean;
}

export interface TripLog {
  id: string;
  origin: string;
  destination: string;
  vehicle: string;
  tollCost?: number;
  fuelCost?: number;
  status: 'ongoing' | 'completed';
  date: string;
}

export interface WorkoutLog {
  id: string;
  title: string;
  routine: string;
  durationMins: number;
  date: string;
  notes?: string;
}

// Notes Types
export interface NormalNote {
  id: string;
  title: string;
  content: string;
  category?: string;
  updatedAt: number;
}

export interface IGNote {
  id: string;
  songTitle: string;
  owner: string;
  content: string;
  backgroundColor: string;
  updatedAt: number;
}

export interface PersonalNote {
  id: string;
  personName: string;
  extraNotes: string;
  customFields: { key: string; value: string }[];
  updatedAt: number;
}

export interface WorshipPref {
  city: string;
  portalUrl: string;
  lastCheckedAt?: string;
}

export type ActiveAppView = 'hub' | 'kosman' | 'finance' | 'activities' | 'notes' | 'worship';

export interface AppVersionState {
  hub: string;
  kosman: string;
  finance: string;
  activities: string;
  notes: string;
  worship: string;
}

export interface PrayerSchedule {
  city: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface DeveloperSuggestion {
  id: string;
  title: string;
  type: 'bugfix' | 'feature' | 'optimization' | 'security';
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  suggestedAction: string;
  applied: boolean;
}
