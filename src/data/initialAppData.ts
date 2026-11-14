import { 
  FinanceRecord, SavingGoal, Budget, WishlistItem, BudgetPos, BudgetConfig, DailyIncomeEntry,
  RoutineActivity, MissedPrayer, DailyGoal, WorkoutLog, TripLog,
  NormalNote, IGNote, PersonalNote, AppVersionState, WorshipPref
} from '../types/kosman';

export const INITIAL_APP_VERSIONS: AppVersionState = {
  hub: '2.4.3',
  kosman: '2.4.3',
  finance: '2.4.3',
  activities: '2.4.3',
  notes: '2.4.3',
  worship: '2.4.3'
};

export const TARGET_SPREADSHEET_ID = '1npqZQRi9KLtQBwi2iLohxgZQyjQjWYpirB6oTHvlmYw';

export const INITIAL_FINANCE_RECORDS: FinanceRecord[] = [];
export const INITIAL_SAVING_GOALS: SavingGoal[] = [];
export const INITIAL_BUDGETS: Budget[] = [];
export const INITIAL_WISHLIST_ITEMS: WishlistItem[] = [];
export const INITIAL_DAILY_INCOMES: DailyIncomeEntry[] = [];

export const INITIAL_BUDGET_CONFIG: BudgetConfig = {
  periodType: 'monthly',
  incomeAmount: 1500000,
};

export const INITIAL_BUDGET_POS: BudgetPos[] = [
  {
    id: 'pos-makan',
    name: 'Makan & Minum',
    weeklyTarget: 131250,
    allocationPercent: 35,
    linkedCategories: ['Makan & Minum', 'Makanan', 'Minuman'],
    color: '#FFD000',
  },
  {
    id: 'pos-kos',
    name: 'Sewa & Listrik Kos',
    weeklyTarget: 93750,
    allocationPercent: 25,
    linkedCategories: ['Sewa Kos', 'Listrik & Utilitas', 'Kelistrikan & Kos'],
    color: '#00E5FF',
  },
  {
    id: 'pos-belanja',
    name: 'Belanja KosMan & Dapur',
    weeklyTarget: 56250,
    allocationPercent: 15,
    linkedCategories: ['Belanja KosMan', 'Bumbu Dapur', 'Kebersihan & Toilet', 'Keperluan Rumah Tangga', 'Kesehatan', 'Belanja'],
    color: '#FF4B82',
  },
  {
    id: 'pos-tabungan',
    name: 'Tabungan Wajib',
    weeklyTarget: 56250,
    allocationPercent: 15,
    linkedCategories: ['Tabungan'],
    color: '#A3E635',
  },
  {
    id: 'pos-keinginan',
    name: 'Keinginan & Transport',
    weeklyTarget: 37500,
    allocationPercent: 10,
    linkedCategories: ['Keinginan', 'Transportasi', 'Kebutuhan Pribadi', 'Lainnya'],
    color: '#A855F7',
  },
];

// Initial Daily Activities & Routines
export const INITIAL_ROUTINE_ACTIVITIES: RoutineActivity[] = [];
export const INITIAL_MISSED_PRAYERS: MissedPrayer[] = [];
export const INITIAL_DAILY_GOALS: DailyGoal[] = [];
export const INITIAL_WORKOUT_LOGS: WorkoutLog[] = [];
export const INITIAL_TRIP_LOGS: TripLog[] = [];

// Initial Notes
export const INITIAL_NORMAL_NOTES: NormalNote[] = [];
export const INITIAL_IG_NOTES: IGNote[] = [];
export const INITIAL_PERSONAL_NOTES: PersonalNote[] = [];

export const INITIAL_WORSHIP_PREF: WorshipPref = {
  city: 'Jakarta',
  portalUrl: 'https://waktuibadah.vercel.app',
};
