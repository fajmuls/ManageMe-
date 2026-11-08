import React, { useState, useEffect } from 'react';
import { 
  RoutineActivity, DailyGoal, TripLog, WorkoutLog, FinanceRecord 
} from '../types/kosman';
import { 
  IconPlus, IconCheck, IconTrash, IconDumbbell, 
  IconMapPin 
} from './icons/SvgIcons';
import { 
  Play, Square, Navigation, Car, Bike, Train, 
  DollarSign, CheckCircle2, Clock, AlertCircle, Sparkles 
} from 'lucide-react';

interface ActivitiesViewProps {
  routines: RoutineActivity[];
  goals: DailyGoal[];
  trips: TripLog[];
  workouts: WorkoutLog[];
  onToggleRoutine: (id: string) => void;
  onAddRoutine: (name: string, category: string) => void;
  onDeleteRoutine: (id: string) => void;
  onToggleGoal: (id: string) => void;
  onAddGoal: (text: string, category: string) => void;
  onDeleteGoal: (id: string) => void;
  onAddTrip: (trip: Omit<TripLog, 'id'>) => void;
  onAddWorkout: (workout: Omit<WorkoutLog, 'id'>) => void;
  onAddFinanceRecord?: (record: Omit<FinanceRecord, 'id' | 'createdAt'>) => void;
}

export function ActivitiesView({
  routines,
  goals,
  trips,
  workouts,
  onToggleRoutine,
  onAddRoutine,
  onDeleteRoutine,
  onToggleGoal,
  onAddGoal,
  onDeleteGoal,
  onAddTrip,
  onAddWorkout,
  onAddFinanceRecord,
}: ActivitiesViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'trips' | 'routine' | 'goals' | 'workout'>('trips');

  // Input states
  const [newRoutineText, setNewRoutineText] = useState('');
  const [newRoutineCategory, setNewRoutineCategory] = useState('Kosan');
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Fokus');

  // Live Trip Tracking State
  const [activeTrip, setActiveTrip] = useState<{
    origin: string;
    destination: string;
    vehicle: string;
    startTime: number;
    notes?: string;
  } | null>(() => {
    const saved = localStorage.getItem('manageme_active_trip');
    return saved ? JSON.parse(saved) : null;
  });

  const [tripElapsedSeconds, setTripElapsedSeconds] = useState(0);
  const [showStartTripModal, setShowStartTripModal] = useState(false);
  const [showEndTripModal, setShowEndTripModal] = useState(false);

  // Start Trip Form
  const [startOrigin, setStartOrigin] = useState('Kosan');
  const [startDest, setStartDest] = useState('');
  const [startVehicle, setStartVehicle] = useState('Motor');
  const [startNotes, setStartNotes] = useState('');

  // End Trip Form
  const [endFuelCost, setEndFuelCost] = useState('');
  const [endTollCost, setEndTollCost] = useState('');
  const [endCondition, setEndCondition] = useState('Lancar');
  const [syncToFinance, setSyncToFinance] = useState(true);

  // Workout Modal
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutRoutine, setWorkoutRoutine] = useState('');
  const [workoutMins, setWorkoutMins] = useState('30');

  // Timer loop for active trip
  useEffect(() => {
    if (!activeTrip) {
      setTripElapsedSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      const now = Date.now();
      setTripElapsedSeconds(Math.floor((now - activeTrip.startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTrip]);

  useEffect(() => {
    if (activeTrip) {
      localStorage.setItem('manageme_active_trip', JSON.stringify(activeTrip));
    } else {
      localStorage.removeItem('manageme_active_trip');
    }
  }, [activeTrip]);

  const formatElapsed = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartTrip = () => {
    if (!startDest.trim()) return;
    const newTrip = {
      origin: startOrigin.trim() || 'Kosan',
      destination: startDest.trim(),
      vehicle: startVehicle,
      startTime: Date.now(),
      notes: startNotes.trim()
    };
    setActiveTrip(newTrip);
    setShowStartTripModal(false);
    setStartDest('');
    setStartNotes('');
  };

  const handleFinishTrip = () => {
    if (!activeTrip) return;
    const fuel = parseFloat(endFuelCost) || 0;
    const toll = parseFloat(endTollCost) || 0;
    const today = new Date().toISOString().split('T')[0];

    // Save to trips history
    onAddTrip({
      origin: activeTrip.origin,
      destination: activeTrip.destination,
      vehicle: activeTrip.vehicle,
      fuelCost: fuel > 0 ? fuel : undefined,
      tollCost: toll > 0 ? toll : undefined,
      status: 'completed',
      date: today
    });

    // Auto-sync fuel & toll to Finance OS if selected!
    if (syncToFinance && onAddFinanceRecord) {
      if (fuel > 0) {
        onAddFinanceRecord({
          type: 'expense',
          amount: fuel,
          category: 'Transportasi',
          subCategory: 'Bahan Bakar',
          note: `BBM Perjalanan: ${activeTrip.origin} ➔ ${activeTrip.destination} (${activeTrip.vehicle})`,
          account: 'Kas',
          date: today
        });
      }
      if (toll > 0) {
        onAddFinanceRecord({
          type: 'expense',
          amount: toll,
          category: 'Transportasi',
          subCategory: 'Tol',
          note: `Tol Perjalanan: ${activeTrip.origin} ➔ ${activeTrip.destination}`,
          account: 'E-Wallet',
          date: today
        });
      }
    }

    setActiveTrip(null);
    setShowEndTripModal(false);
    setEndFuelCost('');
    setEndTollCost('');
  };

  const completedRoutines = routines.filter(r => r.completedToday);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-5">
      
      {/* Top Banner Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* Active Trip Widget */}
        <div className={`border-3 border-black p-3.5 rounded-xl shadow-[4px_4px_0px_#000] flex flex-col justify-between ${
          activeTrip ? 'bg-[#00E5FF] animate-pulse' : 'bg-cyan-100'
        }`}>
          <div>
            <span className="text-[10px] font-black uppercase text-black block flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-black" />
              <span>Trip Tracker</span>
            </span>
            <div className="font-mono font-black text-xl sm:text-2xl text-black mt-1">
              {activeTrip ? formatElapsed(tripElapsedSeconds) : 'Siaga'}
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-800 block truncate mt-1">
            {activeTrip ? `Menuju ${activeTrip.destination}` : 'Belum ada trip aktif'}
          </span>
        </div>

        {/* Rutinitas Card */}
        <div className="bg-[#FFD000] border-3 border-black p-3.5 rounded-xl shadow-[4px_4px_0px_#000] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-black block">Rutinitas Harian</span>
            <div className="font-mono font-black text-xl sm:text-2xl text-black mt-1">
              {completedRoutines.length} / {routines.length}
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-800 block mt-1">
            {routines.length === 0 ? 'Belum ada rutinitas' : `${Math.round((completedRoutines.length / routines.length) * 100)}% Terselesaikan`}
          </span>
        </div>

        {/* Target Harian */}
        <div className="bg-[#A3E635] border-3 border-black p-3.5 rounded-xl shadow-[4px_4px_0px_#000] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-black block">Target Harian</span>
            <div className="font-mono font-black text-xl sm:text-2xl text-black mt-1">
              {goals.filter(g => g.completed).length} / {goals.length}
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-800 block mt-1">
            {goals.filter(g => !g.completed).length} Target Aktif
          </span>
        </div>

        {/* Workout / Kebugaran */}
        <div className="bg-[#FF4B82] text-white border-3 border-black p-3.5 rounded-xl shadow-[4px_4px_0px_#000] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-white block">Log Workout</span>
            <div className="font-mono font-black text-xl sm:text-2xl text-white mt-1">
              {workouts.length} Latihan
            </div>
          </div>
          <span className="text-[10px] font-bold text-white/90 block mt-1">
            Kebugaran & stamina
          </span>
        </div>

      </div>

      {/* Floating Active Trip Banner if running */}
      {activeTrip && (
        <div className="bg-[#00E5FF] border-3 border-black shadow-[5px_5px_0px_#000] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black text-[#00E5FF] flex items-center justify-center font-black">
              {activeTrip.vehicle === 'Mobil' ? <Car className="w-6 h-6" /> : <Bike className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-black text-white text-[10px] font-black px-1.5 py-0.2 rounded uppercase">
                  Sedang Berlangsung
                </span>
                <span className="font-mono font-black text-black tabular-nums">
                  {formatElapsed(tripElapsedSeconds)}
                </span>
              </div>
              <h4 className="font-black text-sm text-black">
                {activeTrip.origin} ➔ {activeTrip.destination} ({activeTrip.vehicle})
              </h4>
            </div>
          </div>

          <button
            onClick={() => setShowEndTripModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-black text-white hover:bg-slate-900 border-2 border-black rounded-lg text-xs font-black shadow-[3px_3px_0px_#FFD000] active:translate-x-0.5 active:translate-y-0.5"
          >
            Selesaikan Perjalanan & Catat Biaya
          </button>
        </div>
      )}

      {/* Sub Tabs Bar */}
      <div className="bg-white border-3 border-black p-2.5 rounded-xl shadow-[3px_3px_0px_#000]">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('trips')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
              activeSubTab === 'trips'
                ? 'bg-[#00E5FF] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                : 'text-slate-700 hover:text-black hover:bg-slate-100'
            }`}
          >
            🚗 Bepergian & Perjalanan ({trips.length})
          </button>

          <button
            onClick={() => setActiveSubTab('routine')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
              activeSubTab === 'routine'
                ? 'bg-[#FFD000] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                : 'text-slate-700 hover:text-black hover:bg-slate-100'
            }`}
          >
            📋 Rutinitas Harian ({routines.length})
          </button>

          <button
            onClick={() => setActiveSubTab('goals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
              activeSubTab === 'goals'
                ? 'bg-[#A3E635] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                : 'text-slate-700 hover:text-black hover:bg-slate-100'
            }`}
          >
            🎯 Target Harian ({goals.length})
          </button>

          <button
            onClick={() => setActiveSubTab('workout')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
              activeSubTab === 'workout'
                ? 'bg-[#FF4B82] text-white border-2 border-black shadow-[2px_2px_0px_#000]'
                : 'text-slate-700 hover:text-black hover:bg-slate-100'
            }`}
          >
            💪 Workout & Kebugaran ({workouts.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: TRIPS & BEPERGIAN */}
      {activeSubTab === 'trips' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-3 border-black p-4 rounded-xl shadow-[4px_4px_0px_#000]">
            <div>
              <h3 className="font-black text-base text-black uppercase flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#00E5FF]" />
                <span>Pelacak Perjalanan & Bepergian Darat</span>
              </h3>
              <p className="text-xs font-bold text-slate-600">
                Mulai live timer saat bepergian dan otomatis catat biaya bensin & tol langsung ke Keuangan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {activeTrip ? (
                <button
                  onClick={() => setShowEndTripModal(true)}
                  className="px-4 py-2 bg-[#FF4B82] text-white border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Square className="w-4 h-4 inline mr-1 fill-current" />
                  Selesaikan Trip
                </button>
              ) : (
                <button
                  onClick={() => setShowStartTripModal(true)}
                  className="px-4 py-2 bg-[#00E5FF] text-black border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Play className="w-4 h-4 inline mr-1 fill-current" />
                  Mulai Perjalanan Baru
                </button>
              )}
            </div>
          </div>

          {/* Trips History Grid */}
          {trips.length === 0 ? (
            <div className="bg-white border-3 border-dashed border-slate-300 rounded-xl p-8 text-center space-y-3">
              <Car className="w-12 h-12 text-slate-400 mx-auto" />
              <h4 className="font-black text-sm text-black">Belum Ada Riwayat Perjalanan</h4>
              <p className="text-xs font-bold text-slate-500 max-w-sm mx-auto">
                Mulai catat rute keberangkatan harian seperti kantor, kampus, pasar, atau mudik dengan live timer.
              </p>
              <button
                onClick={() => setShowStartTripModal(true)}
                className="px-4 py-2 bg-[#FFD000] text-black border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_#000]"
              >
                Mulai Perjalanan Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {trips.map(trip => (
                <div key={trip.id} className="bg-white border-3 border-black rounded-xl p-4 shadow-[3px_3px_0px_#000] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase bg-[#FFFDF6] border border-black px-2 py-0.5 rounded">
                      {trip.vehicle} · {trip.status}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">{trip.date}</span>
                  </div>
                  <div className="font-black text-sm text-black">
                    {trip.origin} ➔ {trip.destination}
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t border-black/10 text-xs font-bold text-slate-700">
                    {trip.fuelCost ? (
                      <span>BBM: <strong className="font-mono text-black">Rp {trip.fuelCost.toLocaleString('id-ID')}</strong></span>
                    ) : null}
                    {trip.tollCost ? (
                      <span>Tol: <strong className="font-mono text-black">Rp {trip.tollCost.toLocaleString('id-ID')}</strong></span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: RUTINITAS HARIAN */}
      {activeSubTab === 'routine' && (
        <div className="space-y-4">
          <div className="bg-white border-3 border-black p-4 rounded-xl shadow-[3px_3px_0px_#000]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newRoutineText.trim()) return;
                onAddRoutine(newRoutineText.trim(), newRoutineCategory);
                setNewRoutineText('');
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={newRoutineText}
                onChange={(e) => setNewRoutineText(e.target.value)}
                placeholder="Tambah rutinitas baru (misal: Minum air putih 2L, Cek kompor, Bersihkan kamar)..."
                className="flex-1 px-3 py-2 border-2 border-black rounded-lg font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#FFD000]"
              />
              <div className="flex gap-2">
                <select
                  value={newRoutineCategory}
                  onChange={(e) => setNewRoutineCategory(e.target.value)}
                  className="px-2.5 py-2 border-2 border-black rounded-lg font-bold text-xs bg-white"
                >
                  <option value="Kosan">Kosan</option>
                  <option value="Kesehatan">Kesehatan</option>
                  <option value="Belajar">Belajar</option>
                  <option value="Kebiasaan">Kebiasaan</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FFD000] text-black border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000] shrink-0"
                >
                  <IconPlus className="w-3.5 h-3.5 inline mr-1" />
                  Tambah
                </button>
              </div>
            </form>
          </div>

          {routines.length === 0 ? (
            <div className="bg-white border-3 border-dashed border-slate-300 rounded-xl p-8 text-center space-y-2">
              <p className="text-xs font-bold text-slate-500">
                Belum ada rutinitas terdaftar. Tambahkan rutinitas di atas untuk mulai mencentang kebiasaan harian Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {routines.map(item => (
                <div
                  key={item.id}
                  className={`border-3 border-black rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all ${
                    item.completedToday 
                      ? 'bg-[#A3E635]/30 shadow-[2px_2px_0px_#000]' 
                      : 'bg-white shadow-[3px_3px_0px_#000]'
                  }`}
                >
                  <button
                    onClick={() => onToggleRoutine(item.id)}
                    className="flex items-center gap-3 text-left flex-1 min-w-0"
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 border-black flex items-center justify-center shrink-0 ${
                      item.completedToday ? 'bg-[#A3E635] text-black' : 'bg-white'
                    }`}>
                      {item.completedToday && <IconCheck className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className={`text-xs sm:text-sm font-black block ${
                        item.completedToday ? 'line-through text-slate-500' : 'text-black'
                      }`}>
                        {item.name}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        {item.category}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => onDeleteRoutine(item.id)}
                    className="text-slate-400 hover:text-red-600 p-1 shrink-0"
                    title="Hapus Rutinitas"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: TARGET HARIAN */}
      {activeSubTab === 'goals' && (
        <div className="space-y-4">
          <div className="bg-white border-3 border-black p-4 rounded-xl shadow-[3px_3px_0px_#000]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newGoalText.trim()) return;
                onAddGoal(newGoalText.trim(), newGoalCategory);
                setNewGoalText('');
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder="Target harian baru (contoh: Belajar 2 jam, rapikan meja kos, bayar tagihan)..."
                className="flex-1 px-3 py-2 border-2 border-black rounded-lg font-bold text-xs"
              />
              <div className="flex gap-2">
                <select
                  value={newGoalCategory}
                  onChange={(e) => setNewGoalCategory(e.target.value)}
                  className="px-2.5 py-2 border-2 border-black rounded-lg font-bold text-xs bg-white"
                >
                  <option value="Fokus">Fokus</option>
                  <option value="Kosan">Kosan</option>
                  <option value="Keuangan">Keuangan</option>
                  <option value="Kesehatan">Kesehatan</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#A3E635] text-black border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000]"
                >
                  Tambah Target
                </button>
              </div>
            </form>
          </div>

          {goals.length === 0 ? (
            <div className="bg-white border-3 border-dashed border-slate-300 rounded-xl p-8 text-center">
              <p className="text-xs font-bold text-slate-500">
                Belum ada target harian. Tetapkan sasaran hari ini untuk produktivitas optimal.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {goals.map(g => (
                <div
                  key={g.id}
                  className={`bg-white border-3 border-black rounded-xl p-3 flex items-center justify-between gap-3 ${
                    g.completed ? 'bg-[#A3E635]/20 shadow-[2px_2px_0px_#000]' : 'shadow-[3px_3px_0px_#000]'
                  }`}
                >
                  <button
                    onClick={() => onToggleGoal(g.id)}
                    className="flex items-center gap-3 text-left flex-1"
                  >
                    <div className={`w-5 h-5 rounded-md border-2 border-black flex items-center justify-center shrink-0 ${
                      g.completed ? 'bg-[#A3E635] text-black' : 'bg-white'
                    }`}>
                      {g.completed && <IconCheck className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs sm:text-sm font-bold ${
                      g.completed ? 'line-through text-slate-500' : 'text-black'
                    }`}>
                      {g.text}
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase bg-[#FFFDF6] border border-black px-1.5 py-0.5 rounded">
                      {g.category}
                    </span>
                    <button
                      onClick={() => onDeleteGoal(g.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
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

      {/* SUBTAB 4: WORKOUT & FITNESS */}
      {activeSubTab === 'workout' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border-3 border-black p-4 rounded-xl shadow-[3px_3px_0px_#000]">
            <div>
              <h3 className="font-black text-base text-black uppercase">
                LOG WORKOUT & OLAHRAGA
              </h3>
              <p className="text-xs font-bold text-slate-600">
                Pencatatan sesi latihan fisik, push-up, jogging, dan durasi menit.
              </p>
            </div>
            <button
              onClick={() => setShowWorkoutModal(true)}
              className="px-4 py-2 bg-[#FF4B82] text-white border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
            >
              <IconPlus className="w-3.5 h-3.5 inline mr-1" />
              Catat Latihan
            </button>
          </div>

          {workouts.length === 0 ? (
            <div className="bg-white border-3 border-dashed border-slate-300 rounded-xl p-8 text-center space-y-2">
              <IconDumbbell className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-500">
                Belum ada catatan latihan. Mulai dengan mencatat olahraga ringan harian!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {workouts.map(w => (
                <div key={w.id} className="bg-white border-3 border-black rounded-xl p-4 shadow-[3px_3px_0px_#000] space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-sm sm:text-base text-black uppercase">{w.title}</h4>
                    <span className="text-[10px] font-bold bg-[#FFD000] border border-black px-2 py-0.5 rounded font-mono">
                      {w.durationMins} Menit
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-700">{w.routine}</p>
                  {w.notes && <p className="text-[11px] text-slate-500 italic">"{w.notes}"</p>}
                  <div className="text-[10px] font-mono text-slate-400">{w.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: MULAI PERJALANAN */}
      {showStartTripModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-3 border-black rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-[6px_6px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="font-black text-base uppercase text-black flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#00E5FF]" />
                <span>Mulai Perjalanan Baru</span>
              </h3>
              <button onClick={() => setShowStartTripModal(false)} className="font-bold text-sm">✕</button>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 uppercase mb-1">Lokasi Asal</label>
              <input
                type="text"
                value={startOrigin}
                onChange={(e) => setStartOrigin(e.target.value)}
                placeholder="Kosan, Rumah, Kantor..."
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 uppercase mb-1">Lokasi Tujuan *</label>
              <input
                type="text"
                required
                value={startDest}
                onChange={(e) => setStartDest(e.target.value)}
                placeholder="Kampus, Pasar, Mall, Stasiun..."
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 uppercase mb-1">Jenis Kendaraan</label>
              <div className="grid grid-cols-4 gap-2">
                {['Motor', 'Mobil', 'KRL / Bus', 'Jalan'].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setStartVehicle(v)}
                    className={`py-2 px-1 text-center border-2 border-black rounded-lg text-xs font-bold transition-all ${
                      startVehicle === v ? 'bg-[#FFD000] shadow-[2px_2px_0px_#000]' : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 uppercase mb-1">Catatan Rute (Opsional)</label>
              <input
                type="text"
                value={startNotes}
                onChange={(e) => setStartNotes(e.target.value)}
                placeholder="Lewat jalan tol, cuaca cerah..."
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t-2 border-black/10">
              <button
                type="button"
                onClick={() => setShowStartTripModal(false)}
                className="px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleStartTrip}
                className="px-4 py-2 bg-[#00E5FF] text-black border-2 border-black rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_#000]"
              >
                Mulai Stopwatch Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SELESAIKAN PERJALANAN & INTEGRASI KEUANGAN */}
      {showEndTripModal && activeTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-3 border-black rounded-2xl p-5 max-w-md w-full space-y-4 shadow-[6px_6px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <div>
                <h3 className="font-black text-base uppercase text-black">Selesaikan Perjalanan</h3>
                <p className="text-xs font-bold text-slate-500">
                  {activeTrip.origin} ➔ {activeTrip.destination} ({formatElapsed(tripElapsedSeconds)})
                </p>
              </div>
              <button onClick={() => setShowEndTripModal(false)} className="font-bold text-sm">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase mb-1">Biaya BBM (IDR)</label>
                <input
                  type="number"
                  value={endFuelCost}
                  onChange={(e) => setEndFuelCost(e.target.value)}
                  placeholder="25000"
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase mb-1">Biaya Tol (IDR)</label>
                <input
                  type="number"
                  value={endTollCost}
                  onChange={(e) => setEndTollCost(e.target.value)}
                  placeholder="15000"
                  className="w-full px-3 py-2 border-2 border-black rounded-xl font-mono text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 uppercase mb-1">Kondisi Perjalanan</label>
              <select
                value={endCondition}
                onChange={(e) => setEndCondition(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs bg-white"
              >
                <option value="Lancar">Lancar & Cepat</option>
                <option value="Macet">Padat / Macet</option>
                <option value="Hujan">Hujan Deras</option>
              </select>
            </div>

            {/* Auto-Sync to Finance Checkbox */}
            <div className="p-3 bg-[#FFD000]/30 border-2 border-black rounded-xl flex items-start gap-2.5">
              <input
                type="checkbox"
                id="syncFinCheck"
                checked={syncToFinance}
                onChange={(e) => setSyncToFinance(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-black cursor-pointer"
              />
              <label htmlFor="syncFinCheck" className="text-xs font-bold text-slate-900 cursor-pointer">
                <strong>Otomatis catat biaya ke Keuangan:</strong> Biaya bensin & tol akan langsung dibukukan sebagai pengeluaran baru di menu Keuangan tanpa perlu input ulang.
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t-2 border-black/10">
              <button
                type="button"
                onClick={() => setShowEndTripModal(false)}
                className="px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleFinishTrip}
                className="px-4 py-2 bg-[#A3E635] text-black border-2 border-black rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_#000]"
              >
                Simpan & Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD WORKOUT */}
      {showWorkoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-3 border-black rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-[6px_6px_0px_#000]">
            <h3 className="font-black text-base uppercase text-black">Catat Latihan Workout</h3>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-1">Judul Latihan *</label>
              <input
                type="text"
                required
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                placeholder="Push-up & Core, Jogging Sore..."
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-1">Detail Gerakan</label>
              <textarea
                value={workoutRoutine}
                onChange={(e) => setWorkoutRoutine(e.target.value)}
                placeholder="Push-up 3 set x 15, Dumbbell curl 3 set x 12..."
                rows={2}
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-1">Durasi (Menit)</label>
              <input
                type="number"
                value={workoutMins}
                onChange={(e) => setWorkoutMins(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-mono text-xs font-bold"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowWorkoutModal(false)}
                className="px-3 py-1.5 border-2 border-black rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!workoutTitle.trim()) return;
                  onAddWorkout({
                    title: workoutTitle.trim(),
                    routine: workoutRoutine.trim() || 'Latihan kebugaran',
                    durationMins: parseInt(workoutMins) || 20,
                    date: new Date().toISOString().split('T')[0]
                  });
                  setShowWorkoutModal(false);
                  setWorkoutTitle('');
                  setWorkoutRoutine('');
                }}
                className="px-4 py-1.5 bg-[#FF4B82] text-white border-2 border-black rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_#000]"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
