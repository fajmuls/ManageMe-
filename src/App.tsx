import React, { useState, useEffect } from 'react';
import { 
  KosItem, FinanceRecord, SavingGoal, Budget, 
  RoutineActivity, MissedPrayer, DailyGoal, TripLog, WorkoutLog,
  NormalNote, IGNote, PersonalNote, AppVersionState, FardhuPrayer
} from './types/kosman';
import { INITIAL_KOS_ITEMS } from './data/kosmanItems';
import { 
  INITIAL_APP_VERSIONS, INITIAL_FINANCE_RECORDS, INITIAL_SAVING_GOALS, 
  INITIAL_BUDGETS, INITIAL_ROUTINE_ACTIVITIES, INITIAL_MISSED_PRAYERS, 
  INITIAL_DAILY_GOALS, INITIAL_WORKOUT_LOGS, INITIAL_TRIP_LOGS, 
  INITIAL_NORMAL_NOTES, INITIAL_IG_NOTES, INITIAL_PERSONAL_NOTES 
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
import { autoSyncFinanceToSheets, autoSyncKosmanToSheets, autoSyncActivityToSheets } from './services/googleSheetsAutoSync';

// Clean zero-state reset for v2.0.0 requested by user (catalog quantity: 0, transactions: 0, routines: 0)
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

export default function App() {
  // Navigation View State ('hub' | 'kosman' | 'finance' | 'activities' | 'notes' | 'worship')
  const [currentView, setCurrentView] = useState<ActiveAppView>('hub');

  // Modals state
  const [showChatGPTModal, setShowChatGPTModal] = useState(false);
  const [showGoogleSheetsModal, setShowGoogleSheetsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // App Versions state (Tracked exclusively in Settings)
  const [versions, setVersions] = useState<AppVersionState>(() => {
    const saved = localStorage.getItem('manageme_app_versions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_APP_VERSIONS, ...parsed };
      } catch (e) {
        console.error('Failed to parse app versions:', e);
      }
    }
    return INITIAL_APP_VERSIONS;
  });

  // KosMan Items Dataset State (Catalog only, quantities 0 initially)
  const [items, setItems] = useState<KosItem[]>(() => {
    const saved = localStorage.getItem('manageme_kosman_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {
        console.error('Failed to parse saved kosman items:', err);
      }
    }
    return INITIAL_KOS_ITEMS;
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
  useEffect(() => {
    localStorage.setItem('manageme_app_versions', JSON.stringify(versions));
  }, [versions]);

  useEffect(() => {
    localStorage.setItem('manageme_kosman_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('manageme_finance_records', JSON.stringify(financeRecords));
  }, [financeRecords]);

  useEffect(() => {
    localStorage.setItem('manageme_savings', JSON.stringify(savings));
  }, [savings]);

  useEffect(() => {
    localStorage.setItem('manageme_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('manageme_routines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem('manageme_prayers', JSON.stringify(prayers));
  }, [prayers]);

  useEffect(() => {
    localStorage.setItem('manageme_daily_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('manageme_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('manageme_workouts', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem('manageme_normal_notes', JSON.stringify(normalNotes));
  }, [normalNotes]);

  useEffect(() => {
    localStorage.setItem('manageme_ig_notes', JSON.stringify(igNotes));
  }, [igNotes]);

  useEffect(() => {
    localStorage.setItem('manageme_personal_notes', JSON.stringify(personalNotes));
  }, [personalNotes]);

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

  const handleImportParsedChatGPTItems = (parsedList: { name: string; quantity: number; price: number }[]) => {
    const newItems: KosItem[] = parsedList.map((p, idx) => ({
      id: 'chatgpt-import-' + Date.now() + '-' + idx,
      name: p.name,
      category: 'Bumbu Dapur',
      subCategory: 'Penyedap',
      quantity: p.quantity,
      unit: 'buah',
      price: p.price,
      timesPurchased: 0,
      totalSpend: 0,
      minThreshold: 1,
      lastPurchasedDate: new Date().toISOString().split('T')[0],
      notes: 'Imported via ChatGPT'
    }));

    setItems(prev => [...newItems, ...prev]);
  };

  // Finance Handlers
  const handleAddFinanceRecord = (newRec: Omit<FinanceRecord, 'id' | 'createdAt'>) => {
    const record: FinanceRecord = {
      ...newRec,
      id: 'fin-' + Date.now(),
      createdAt: Date.now()
    };
    setFinanceRecords(prev => [record, ...prev]);
    autoSyncFinanceToSheets(record);

    // Auto-sync to KosMan items if it is an expense matching an item or Belanja KosMan
    if (newRec.type === 'expense') {
      const lowerNote = (newRec.note || '').toLowerCase();
      const lowerCat = (newRec.category || '').toLowerCase();

      setItems(prevItems => {
        let matched = false;
        const updated = prevItems.map(item => {
          const lowerName = item.name.toLowerCase();
          // Check if item name is mentioned in note or exactly matches
          if (
            (lowerNote.length > 2 && (lowerNote.includes(lowerName) || lowerName.includes(lowerNote))) ||
            (lowerCat.includes('kosman') && lowerNote.includes(lowerName))
          ) {
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

  // Daily Log Handlers
  const handleToggleRoutine = (id: string) => {
    setRoutines(prev => prev.map(r => (r.id === id ? { ...r, completedToday: !r.completedToday } : r)));
  };

  const handleAddRoutine = (name: string, category: string) => {
    const newAct: RoutineActivity = {
      id: 'act-' + Date.now(),
      name,
      category,
      completedToday: false
    };
    setRoutines(prev => [...prev, newAct]);
  };

  const handleDeleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
  };

  const handleTogglePrayer = (id: string) => {
    setPrayers(prev => prev.map(p => (p.id === id ? { ...p, completed: !p.completed } : p)));
  };

  const handleAddPrayer = (prayer: FardhuPrayer, dateInfo: string) => {
    const newPrayer: MissedPrayer = {
      id: 'mp-' + Date.now(),
      prayer,
      dateInfo,
      completed: false
    };
    setPrayers(prev => [newPrayer, ...prev]);
  };

  const handleDeletePrayer = (id: string) => {
    setPrayers(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, completed: !g.completed } : g)));
  };

  const handleAddGoal = (text: string, category: string) => {
    const newGoal: DailyGoal = {
      id: 'dg-' + Date.now(),
      text,
      category,
      completed: false
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleAddTrip = (trip: Omit<TripLog, 'id'>) => {
    const newTrip: TripLog = {
      ...trip,
      id: 'trip-' + Date.now()
    };
    setTrips(prev => [newTrip, ...prev]);
    autoSyncActivityToSheets({
      id: newTrip.id,
      date: newTrip.date,
      type: 'Perjalanan',
      title: `${newTrip.origin} ➔ ${newTrip.destination}`,
      info: `Kendaraan: ${newTrip.vehicle}${newTrip.fuelCost ? `, BBM: Rp ${newTrip.fuelCost}` : ''}${newTrip.tollCost ? `, Tol: Rp ${newTrip.tollCost}` : ''}`
    });
  };

  const handleAddWorkout = (workout: Omit<WorkoutLog, 'id'>) => {
    const newWorkout: WorkoutLog = {
      ...workout,
      id: 'wo-' + Date.now()
    };
    setWorkouts(prev => [newWorkout, ...prev]);
  };

  // Notes Handlers
  const handleAddNormalNote = (title: string, content: string, category: string) => {
    const newNote: NormalNote = {
      id: 'nn-' + Date.now(),
      title,
      content,
      category,
      updatedAt: Date.now()
    };
    setNormalNotes(prev => [newNote, ...prev]);
  };

  const handleDeleteNormalNote = (id: string) => {
    setNormalNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleAddIGNote = (songTitle: string, content: string) => {
    const newIG: IGNote = {
      id: 'ign-' + Date.now(),
      songTitle,
      owner: 'ManageMe',
      content,
      backgroundColor: '#18181b',
      updatedAt: Date.now()
    };
    setIgNotes(prev => [newIG, ...prev]);
  };

  const handleDeleteIGNote = (id: string) => {
    setIgNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleAddPersonalNote = (personName: string, extraNotes: string, customFields: { key: string; value: string }[]) => {
    const newPersonal: PersonalNote = {
      id: 'pn-' + Date.now(),
      personName,
      extraNotes,
      customFields,
      updatedAt: Date.now()
    };
    setPersonalNotes(prev => [newPersonal, ...prev]);
  };

  const handleDeletePersonalNote = (id: string) => {
    setPersonalNotes(prev => prev.filter(n => n.id !== id));
  };

  // Reset all data to factory default
  const handleResetAllData = () => {
    setItems(INITIAL_KOS_ITEMS);
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

  // Import full JSON backup
  const handleImportAllData = (backupData: any) => {
    if (backupData.items) setItems(backupData.items);
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
    <div className="min-h-screen bg-[#FFFDF6] text-slate-900 flex flex-col font-sans selection:bg-[#FFD000] selection:text-black">
      
      {/* Top Pop Comic Navbar (No version, no central suit, no Google Sign-in, compact on mobile) */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenChatGPT={() => setShowChatGPTModal(true)}
        onOpenGoogleSheets={() => setShowGoogleSheetsModal(true)}
      />

      {/* Main View Router */}
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
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
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
            onAddRecord={handleAddFinanceRecord}
            onDeleteRecord={handleDeleteFinanceRecord}
            onAddSaving={handleAddSaving}
            onUpdateSaving={handleUpdateSaving}
            onDeleteSaving={handleDeleteSaving}
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

        {currentView === 'worship' && (
          <WorshipView />
        )}
      </main>

      {/* Pop Comic Footer (Clean without version tag, versions only in settings) */}
      <footer className="bg-black text-white border-t-2 sm:border-t-3 border-black py-4 sm:py-5 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs font-bold">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#FF4B82] text-white border border-white rounded flex items-center justify-center font-black text-xs">
              M!
            </div>
            <span>ManageMe! — Solusi Manajemen Terpusat (Pop Comic Edition)</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-slate-400 overflow-x-auto">
            <button onClick={() => setCurrentView('hub')} className="hover:text-white transition-colors">
              Hub
            </button>
            <span>·</span>
            <button onClick={() => setCurrentView('kosman')} className="hover:text-white transition-colors">
              KosMan
            </button>
            <span>·</span>
            <button onClick={() => setCurrentView('finance')} className="hover:text-white transition-colors">
              Keuangan
            </button>
            <span>·</span>
            <button onClick={() => setCurrentView('activities')} className="hover:text-white transition-colors">
              Kegiatan
            </button>
            <span>·</span>
            <button onClick={() => setCurrentView('notes')} className="hover:text-white transition-colors">
              Catatan
            </button>
            <span>·</span>
            <button onClick={() => setCurrentView('worship')} className="hover:text-white transition-colors">
              Waktu Ibadah
            </button>
            <span>·</span>
            <button onClick={() => setShowSettingsModal(true)} className="hover:text-white transition-colors">
              Pengaturan & Versi
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ChatGPTModal
        isOpen={showChatGPTModal}
        onClose={() => setShowChatGPTModal(false)}
        items={items}
        onImportParsedItems={handleImportParsedChatGPTItems}
      />

      <GoogleSheetsModal
        isOpen={showGoogleSheetsModal}
        onClose={() => setShowGoogleSheetsModal(false)}
        items={items}
        financeRecords={financeRecords}
        onUpdateAllItems={setItems}
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
