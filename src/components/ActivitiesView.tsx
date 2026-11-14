import React, { useState, useEffect } from 'react';
import {
  RoutineActivity,
  DailyGoal,
  TripLog,
  WorkoutLog,
  FinanceRecord,
} from '../types/kosman';
import {
  IconPlus,
  IconCheck,
  IconTrash,
  IconDumbbell,
  IconCalendar,
} from './icons/SvgIcons';
import { InlineDropdown, InlineConfirmBar, PopupModal } from './InlineUI';
import { Play, Square, Navigation, Car, Bike, Target } from 'lucide-react';

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

  // Inline confirm deletes
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'routine' | 'goal';
    id: string;
    label: string;
  } | null>(null);

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
  const [showStartTripForm, setShowStartTripForm] = useState(false);
  const [showEndTripForm, setShowEndTripForm] = useState(false);

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

  // Inline Workout Form
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutRoutine, setWorkoutRoutine] = useState('');
  const [workoutMins, setWorkoutMins] = useState('30');

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
    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDest.trim()) return;
    const newTrip = {
      origin: startOrigin.trim() || 'Kosan',
      destination: startDest.trim(),
      vehicle: startVehicle,
      startTime: Date.now(),
      notes: startNotes.trim(),
    };
    setActiveTrip(newTrip);
    setShowStartTripForm(false);
    setStartDest('');
    setStartNotes('');
  };

  const handleFinishTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;
    const fuel = parseFloat(endFuelCost) || 0;
    const toll = parseFloat(endTollCost) || 0;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    onAddTrip({
      origin: activeTrip.origin,
      destination: activeTrip.destination,
      vehicle: activeTrip.vehicle,
      fuelCost: fuel > 0 ? fuel : undefined,
      tollCost: toll > 0 ? toll : undefined,
      status: 'completed',
      date: today,
    });

    if (syncToFinance && onAddFinanceRecord) {
      if (fuel > 0) {
        onAddFinanceRecord({
          type: 'expense',
          amount: fuel,
          category: 'Transportasi',
          subCategory: 'Bahan Bakar',
          note: `BBM Perjalanan (${endCondition}): ${activeTrip.origin} -> ${activeTrip.destination} (${activeTrip.vehicle})`,
          account: 'Kas',
          date: today,
          time: timeStr,
          source: 'app',
        });
      }
      if (toll > 0) {
        onAddFinanceRecord({
          type: 'expense',
          amount: toll,
          category: 'Transportasi',
          subCategory: 'Tol',
          note: `Tol Perjalanan: ${activeTrip.origin} -> ${activeTrip.destination}`,
          account: 'E-Wallet',
          date: today,
          time: timeStr,
          source: 'app',
        });
      }
    }

    setActiveTrip(null);
    setShowEndTripForm(false);
    setEndFuelCost('');
    setEndTollCost('');
  };

  const completedRoutines = routines.filter((r) => r.completedToday);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-5 space-y-3 sm:space-y-4">
      {/* Top Banner Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <div
          className={`border-2 border-black p-2.5 sm:p-3.5 rounded-xl shadow-[3px_3px_0px_#000] flex flex-col justify-between ${
            activeTrip ? 'bg-[#00E5FF]' : 'bg-cyan-100'
          }`}
        >
          <div>
            <span className="text-[10px] font-black uppercase text-black flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-black" />
              <span>Trip Tracker</span>
            </span>
            <div className="font-mono font-black text-lg sm:text-2xl text-black mt-0.5 tabular-nums">
              {activeTrip ? formatElapsed(tripElapsedSeconds) : 'Siaga'}
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-800 block truncate mt-0.5">
            {activeTrip ? `Menuju ${activeTrip.destination}` : 'Belum ada trip aktif'}
          </span>
        </div>

        <div className="bg-[#FFD000] border-2 border-black p-2.5 sm:p-3.5 rounded-xl shadow-[3px_3px_0px_#000] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-black block">Rutinitas Harian</span>
            <div className="font-mono font-black text-lg sm:text-2xl text-black mt-0.5 tabular-nums">
              {completedRoutines.length} / {routines.length}
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-800 block mt-0.5">
            {routines.length === 0
              ? 'Belum ada rutinitas'
              : `${Math.round((completedRoutines.length / routines.length) * 100)}% Terselesaikan`}
          </span>
        </div>

        <div className="bg-[#A3E635] border-2 border-black p-2.5 sm:p-3.5 rounded-xl shadow-[3px_3px_0px_#000] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-black block">Target Harian</span>
            <div className="font-mono font-black text-lg sm:text-2xl text-black mt-0.5 tabular-nums">
              {goals.filter((g) => g.completed).length} / {goals.length}
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-800 block mt-0.5">
            {goals.filter((g) => !g.completed).length} Target Aktif
          </span>
        </div>

        <div className="bg-[#FF4B82] text-white border-2 border-black p-2.5 sm:p-3.5 rounded-xl shadow-[3px_3px_0px_#000] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-white block">Log Workout</span>
            <div className="font-mono font-black text-lg sm:text-2xl text-white mt-0.5 tabular-nums">
              {workouts.length} Latihan
            </div>
          </div>
          <span className="text-[10px] font-bold text-white/90 block mt-0.5">Kebugaran & stamina</span>
        </div>
      </div>

      {/* Inline Active Trip Bar */}
      {activeTrip && (
        <div className="bg-[#00E5FF] border-2 border-black shadow-[3px_3px_0px_#000] rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-black text-[#00E5FF] flex items-center justify-center font-black shrink-0">
              {activeTrip.vehicle === 'Mobil' ? <Car className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
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
              <h4 className="font-black text-xs sm:text-sm text-black">
                {activeTrip.origin} {'->'} {activeTrip.destination} ({activeTrip.vehicle})
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('trips');
              setShowEndTripForm((v) => !v);
            }}
            className="w-full sm:w-auto px-3.5 py-1.5 bg-black text-white hover:bg-slate-900 border border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_#FFD000]"
          >
            {showEndTripForm ? 'Tutup Form Selesai' : 'Selesaikan Trip & Catat Biaya'}
          </button>
        </div>
      )}

      {/* Sub Tabs Bar */}
      <div className="bg-white border-2 border-black p-2 rounded-xl shadow-[2px_2px_0px_#000]">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('trips')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'trips'
                ? 'bg-[#00E5FF] text-black border border-black shadow-[2px_2px_0px_#000]'
                : 'text-slate-700 hover:text-black hover:bg-slate-100'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Perjalanan ({trips.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('routine')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'routine'
                ? 'bg-[#FFD000] text-black border border-black shadow-[2px_2px_0px_#000]'
                : 'text-slate-700 hover:text-black hover:bg-slate-100'
            }`}
          >
            <IconCalendar className="w-3.5 h-3.5" />
            <span>Rutinitas ({routines.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('goals')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'goals'
                ? 'bg-[#A3E635] text-black border border-black shadow-[2px_2px_0px_#000]'
                : 'text-slate-700 hover:text-black hover:bg-slate-100'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Target Harian ({goals.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('workout')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'workout'
                ? 'bg-[#FF4B82] text-white border border-black shadow-[2px_2px_0px_#000]'
                : 'text-slate-700 hover:text-black hover:bg-slate-100'
            }`}
          >
            <IconDumbbell className="w-3.5 h-3.5" />
            <span>Workout ({workouts.length})</span>
          </button>
        </div>
      </div>

      {/* Inline Delete Confirmation */}
      {confirmDelete && (
        <InlineConfirmBar
          title={`Hapus ${confirmDelete.type === 'routine' ? 'rutinitas' : 'target'} "${confirmDelete.label}"?`}
          confirmLabel="Ya, Hapus"
          onConfirm={() => {
            if (confirmDelete.type === 'routine') onDeleteRoutine(confirmDelete.id);
            if (confirmDelete.type === 'goal') onDeleteGoal(confirmDelete.id);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* SUBTAB 1: TRIPS */}
      {activeSubTab === 'trips' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_#000]">
            <div>
              <h3 className="font-black text-sm text-black uppercase flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-[#00E5FF]" />
                <span>Pelacak Perjalanan & Bepergian</span>
              </h3>
              <p className="text-[11px] font-bold text-slate-600">
                Catat rute perjalanan + biaya bensin & tol langsung ke Keuangan dan Spreadsheet.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {activeTrip ? (
                <button
                  type="button"
                  onClick={() => setShowEndTripForm((v) => !v)}
                  className="px-3.5 py-1.5 bg-[#FF4B82] text-white border border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_#000]"
                >
                  <Square className="w-3.5 h-3.5 inline mr-1 fill-current" />
                  {showEndTripForm ? 'Tutup Form' : 'Selesaikan Trip'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowStartTripForm((v) => !v)}
                  className="px-3.5 py-1.5 bg-[#00E5FF] text-black border border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_#000]"
                >
                  <Play className="w-3.5 h-3.5 inline mr-1 fill-current" />
                  {showStartTripForm ? 'Tutup Form' : 'Mulai Perjalanan Baru'}
                </button>
              )}
            </div>
          </div>

          {/* Pop-Up Start Trip Form */}
          <PopupModal
            isOpen={showStartTripForm && !activeTrip}
            onClose={() => setShowStartTripForm(false)}
            title="Form Mulai Perjalanan Baru"
            subtitle="Mulai stopwatch trip untuk mencatat rute & biaya perjalanan"
            icon={<Navigation className="w-4 h-4 text-black" />}
            headerBg="bg-[#00E5FF]"
            maxWidthClass="max-w-xl"
          >
            <form onSubmit={handleStartTrip} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
                    Lokasi Asal
                  </label>
                  <input
                    type="text"
                    value={startOrigin}
                    onChange={(e) => setStartOrigin(e.target.value)}
                    placeholder="Kosan, Rumah, Kantor..."
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
                    Lokasi Tujuan *
                  </label>
                  <input
                    type="text"
                    required
                    value={startDest}
                    onChange={(e) => setStartDest(e.target.value)}
                    placeholder="Kampus, Pasar, Stasiun..."
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
                  Catatan Rute
                </label>
                <input
                  type="text"
                  value={startNotes}
                  onChange={(e) => setStartNotes(e.target.value)}
                  placeholder="Opsional..."
                  className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
                />
              </div>

              <div className="space-y-2">
                <span className="block text-[10px] font-black text-slate-700 uppercase">
                  Kendaraan
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Motor', 'Mobil', 'KRL / Bus', 'Jalan'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setStartVehicle(v)}
                      className={`px-2.5 py-1 border-2 border-black rounded-lg text-xs font-bold ${
                        startVehicle === v ? 'bg-[#FFD000]' : 'bg-white'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowStartTripForm(false)}
                  className="px-3 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00E5FF] text-black border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000]"
                >
                  Mulai Stopwatch Trip
                </button>
              </div>
            </form>
          </PopupModal>

          {/* Pop-Up End Trip Form */}
          <PopupModal
            isOpen={showEndTripForm && !!activeTrip}
            onClose={() => setShowEndTripForm(false)}
            title={
              activeTrip
                ? `Selesaikan Trip: ${activeTrip.origin} -> ${activeTrip.destination}`
                : 'Selesaikan Perjalanan'
            }
            subtitle="Catat biaya BBM/Tol dan sinkronkan ke Keuangan"
            icon={<Square className="w-4 h-4 text-black" />}
            headerBg="bg-[#FF4B82]"
            maxWidthClass="max-w-xl"
          >
            <form onSubmit={handleFinishTrip} className="space-y-3 pb-12">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-start">
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
                    Biaya BBM (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={endFuelCost}
                    onChange={(e) => setEndFuelCost(e.target.value)}
                    placeholder="25000"
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-mono text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
                    Biaya Tol (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={endTollCost}
                    onChange={(e) => setEndTollCost(e.target.value)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-mono text-xs font-bold bg-white"
                  />
                </div>
                <InlineDropdown
                  label="Kondisi Perjalanan"
                  value={endCondition}
                  options={[
                    { value: 'Lancar', label: 'Lancar & Cepat' },
                    { value: 'Macet', label: 'Padat / Macet' },
                    { value: 'Hujan', label: 'Hujan Deras' },
                  ]}
                  onChange={setEndCondition}
                />
              </div>

              <div className="p-2.5 bg-[#FFD000]/30 border-2 border-black rounded-lg flex items-center gap-2">
                <input
                  type="checkbox"
                  id="syncFinCheck"
                  checked={syncToFinance}
                  onChange={(e) => setSyncToFinance(e.target.checked)}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
                <label htmlFor="syncFinCheck" className="text-xs font-bold text-slate-900 cursor-pointer">
                  Otomatis catat biaya BBM & Tol sebagai pengeluaran di Keuangan
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEndTripForm(false)}
                  className="px-3 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#A3E635] text-black border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000]"
                >
                  Simpan & Selesai
                </button>
              </div>
            </form>
          </PopupModal>

          {/* Trips History Grid */}
          {trips.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-2">
              <Car className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-black text-sm text-black">Belum Ada Riwayat Perjalanan</h4>
              <p className="text-xs font-bold text-slate-500 max-w-sm mx-auto">
                Catat rute perjalanan harian Anda untuk memantau durasi dan biaya BBM/Tol.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_#000] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase bg-[#FFFDF6] border border-black px-2 py-0.5 rounded">
                      {trip.vehicle} · {trip.status}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">{trip.date}</span>
                  </div>
                  <div className="font-black text-sm text-black">
                    {trip.origin} {'->'} {trip.destination}
                  </div>
                  {(trip.fuelCost || trip.tollCost) && (
                    <div className="flex items-center gap-3 pt-1.5 border-t border-black/10 text-xs font-bold text-slate-700">
                      {trip.fuelCost ? (
                        <span>
                          BBM: <strong className="font-mono text-black">Rp {trip.fuelCost.toLocaleString('id-ID')}</strong>
                        </span>
                      ) : null}
                      {trip.tollCost ? (
                        <span>
                          Tol: <strong className="font-mono text-black">Rp {trip.tollCost.toLocaleString('id-ID')}</strong>
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: RUTINITAS HARIAN */}
      {activeSubTab === 'routine' && (
        <div className="space-y-3">
          <div className="bg-white border-2 border-black p-3.5 rounded-xl shadow-[2px_2px_0px_#000]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newRoutineText.trim()) return;
                onAddRoutine(newRoutineText.trim(), newRoutineCategory);
                setNewRoutineText('');
              }}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start"
            >
              <div className="sm:col-span-7">
                <input
                  type="text"
                  value={newRoutineText}
                  onChange={(e) => setNewRoutineText(e.target.value)}
                  placeholder="Tambah rutinitas baru (misal: Minum air 2L, Rapikan kamar)..."
                  className="w-full px-3 py-2 border-2 border-black rounded-lg font-bold text-xs"
                />
              </div>
              <div className="sm:col-span-3">
                <InlineDropdown
                  value={newRoutineCategory}
                  options={['Kosan', 'Kesehatan', 'Belajar', 'Kebiasaan']}
                  onChange={setNewRoutineCategory}
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full px-3 py-2 bg-[#FFD000] text-black border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000]"
                >
                  <IconPlus className="w-3.5 h-3.5 inline mr-1" />
                  Tambah
                </button>
              </div>
            </form>
          </div>

          {routines.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
              <p className="text-xs font-bold text-slate-500">
                Belum ada rutinitas terdaftar. Tambahkan rutinitas di atas untuk mulai mencentang kebiasaan harian Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {routines.map((item) => (
                <div
                  key={item.id}
                  className={`border-2 border-black rounded-xl p-3 flex items-center justify-between gap-2.5 ${
                    item.completedToday ? 'bg-[#A3E635]/30' : 'bg-white shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onToggleRoutine(item.id)}
                    className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 border-black flex items-center justify-center shrink-0 ${
                        item.completedToday ? 'bg-[#A3E635] text-black' : 'bg-white'
                      }`}
                    >
                      {item.completedToday && <IconCheck className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`text-xs font-black block truncate ${
                          item.completedToday ? 'line-through text-slate-500' : 'text-black'
                        }`}
                      >
                        {item.name}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        {item.category}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmDelete({ type: 'routine', id: item.id, label: item.name })}
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
        <div className="space-y-3">
          <div className="bg-white border-2 border-black p-3.5 rounded-xl shadow-[2px_2px_0px_#000]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newGoalText.trim()) return;
                onAddGoal(newGoalText.trim(), newGoalCategory);
                setNewGoalText('');
              }}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start"
            >
              <div className="sm:col-span-7">
                <input
                  type="text"
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  placeholder="Target harian baru (contoh: Belajar 2 jam, bayar listrik)..."
                  className="w-full px-3 py-2 border-2 border-black rounded-lg font-bold text-xs"
                />
              </div>
              <div className="sm:col-span-3">
                <InlineDropdown
                  value={newGoalCategory}
                  options={['Fokus', 'Kosan', 'Keuangan', 'Kesehatan']}
                  onChange={setNewGoalCategory}
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full px-3 py-2 bg-[#A3E635] text-black border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000]"
                >
                  Tambah Target
                </button>
              </div>
            </form>
          </div>

          {goals.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
              <p className="text-xs font-bold text-slate-500">
                Belum ada target harian. Tetapkan sasaran hari ini untuk produktivitas optimal.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {goals.map((g) => (
                <div
                  key={g.id}
                  className={`border-2 border-black rounded-xl p-2.5 flex items-center justify-between gap-2.5 ${
                    g.completed ? 'bg-[#A3E635]/20' : 'bg-white shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onToggleGoal(g.id)}
                    className="flex items-center gap-2.5 text-left flex-1"
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 border-black flex items-center justify-center shrink-0 ${
                        g.completed ? 'bg-[#A3E635] text-black' : 'bg-white'
                      }`}
                    >
                      {g.completed && <IconCheck className="w-3.5 h-3.5" />}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        g.completed ? 'line-through text-slate-500' : 'text-black'
                      }`}
                    >
                      {g.text}
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase bg-[#FFFDF6] border border-black px-1.5 py-0.5 rounded">
                      {g.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete({ type: 'goal', id: g.id, label: g.text })}
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

      {/* SUBTAB 4: WORKOUT */}
      {activeSubTab === 'workout' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white border-2 border-black p-3.5 rounded-xl shadow-[2px_2px_0px_#000]">
            <div>
              <h3 className="font-black text-sm text-black uppercase">Log Workout & Olahraga</h3>
              <p className="text-[11px] font-bold text-slate-600">
                Pencatatan sesi latihan fisik, push-up, jogging, dan durasi menit.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowWorkoutForm((v) => !v)}
              className="px-3.5 py-1.5 bg-[#FF4B82] text-white border border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000]"
            >
              <IconPlus className="w-3.5 h-3.5 inline mr-1" />
              {showWorkoutForm ? 'Tutup Form' : 'Catat Latihan'}
            </button>
          </div>

          {/* Pop-Up Workout Form */}
          <PopupModal
            isOpen={showWorkoutForm}
            onClose={() => setShowWorkoutForm(false)}
            title="Catat Sesi Workout Baru"
            subtitle="Rekam latihan fisik & durasi menit harian"
            icon={<IconDumbbell className="w-4 h-4 text-black" />}
            headerBg="bg-[#FF4B82]"
            maxWidthClass="max-w-xl"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!workoutTitle.trim()) return;
                onAddWorkout({
                  title: workoutTitle.trim(),
                  routine: workoutRoutine.trim() || 'Latihan kebugaran',
                  durationMins: parseInt(workoutMins) || 20,
                  date: new Date().toISOString().split('T')[0],
                });
                setShowWorkoutForm(false);
                setWorkoutTitle('');
                setWorkoutRoutine('');
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
                    Judul Latihan *
                  </label>
                  <input
                    type="text"
                    required
                    value={workoutTitle}
                    onChange={(e) => setWorkoutTitle(e.target.value)}
                    placeholder="Push-up & Core, Jogging..."
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
                    Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={workoutMins}
                    onChange={(e) => setWorkoutMins(e.target.value)}
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-mono text-xs font-bold bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
                  Detail Gerakan
                </label>
                <input
                  type="text"
                  value={workoutRoutine}
                  onChange={(e) => setWorkoutRoutine(e.target.value)}
                  placeholder="Push-up 3x15, Plank 2 menit..."
                  className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowWorkoutForm(false)}
                  className="px-3 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#FF4B82] text-white border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000]"
                >
                  Simpan Latihan
                </button>
              </div>
            </form>
          </PopupModal>

          {workouts.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-2">
              <IconDumbbell className="w-9 h-9 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-500">
                Belum ada catatan latihan. Mulai dengan mencatat olahraga ringan harian!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {workouts.map((w) => (
                <div
                  key={w.id}
                  className="bg-white border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_#000] space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-sm text-black uppercase">{w.title}</h4>
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
    </div>
  );
}
