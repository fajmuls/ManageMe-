import { 
  FinanceRecord, SavingGoal, Budget, 
  RoutineActivity, MissedPrayer, DailyGoal, WorkoutLog, TripLog,
  NormalNote, IGNote, PersonalNote, AppVersionState
} from '../types/kosman';

export const INITIAL_APP_VERSIONS: AppVersionState = {
  hub: '2.2.0',
  kosman: '2.2.0',
  finance: '2.2.0',
  activities: '2.2.0',
  notes: '2.2.0',
  worship: '2.2.0'
};

// Initial Finance Records (Zero-state: nol transaksi sesuai permintaan)
export const INITIAL_FINANCE_RECORDS: FinanceRecord[] = [];

export const INITIAL_SAVING_GOALS: SavingGoal[] = [];

export const INITIAL_BUDGETS: Budget[] = [];

// Initial Daily Activities & Routines (Zero-state: nol rutinitas)
export const INITIAL_ROUTINE_ACTIVITIES: RoutineActivity[] = [];

export const INITIAL_MISSED_PRAYERS: MissedPrayer[] = [];

export const INITIAL_DAILY_GOALS: DailyGoal[] = [];

export const INITIAL_WORKOUT_LOGS: WorkoutLog[] = [];

export const INITIAL_TRIP_LOGS: TripLog[] = [];

// Initial Notes (Zero-state bersih)
export const INITIAL_NORMAL_NOTES: NormalNote[] = [];

export const INITIAL_IG_NOTES: IGNote[] = [];

export const INITIAL_PERSONAL_NOTES: PersonalNote[] = [];

