export type KosCategory = 
  | 'Bumbu Dapur'
  | 'Obat & Kesehatan'
  | 'Kebersihan Toilet'
  | 'Minuman & Galon'
  | 'Cemilan & Makanan'
  | 'Alat Tulis & Kos';

export type StockStatus = 'AMAN' | 'LOW' | 'HABIS';

export interface KosItem {
  id: string;
  name: string; // Simplified clean name (no bulky packaging or gram specs)
  category: KosCategory;
  subCategory: string; // Sub-kategori e.g. 'Es Krim', 'Penyedap', 'Minyak', 'Mie'
  quantity: number;
  unit: string;
  price: number; // in IDR
  timesPurchased: number; // initially 0
  totalSpend: number; // in IDR (initially 0)
  minThreshold: number;
  lastPurchasedDate?: string;
  notes?: string;
}

export type SortOption = 
  | 'name-asc'
  | 'name-desc'
  | 'quantity-asc'
  | 'price-asc'
  | 'price-desc'
  | 'timesPurchased-desc';

// Finance Types
export interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  subCategory?: string;
  note: string;
  account: 'Kas' | 'Bank' | 'E-Wallet';
  date: string; // YYYY-MM-DD
  createdAt: number;
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
  dateStr: string; // YYYY-MM-DD
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

