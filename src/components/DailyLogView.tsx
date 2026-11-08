import React, { useState } from 'react';
import { 
  RoutineActivity, MissedPrayer, DailyGoal, TripLog, WorkoutLog, FardhuPrayer 
} from '../types/kosman';
import { 
  IconCalendar, IconPlus, IconCheck, IconTrash, IconDumbbell, 
  IconMoon, IconMapPin, IconSearch 
} from './icons/SvgIcons';

interface DailyLogViewProps {
  routines: RoutineActivity[];
  prayers: MissedPrayer[];
  goals: DailyGoal[];
  trips: TripLog[];
  workouts: WorkoutLog[];
  onToggleRoutine: (id: string) => void;
  onAddRoutine: (name: string, category: string) => void;
  onDeleteRoutine: (id: string) => void;
  onTogglePrayer: (id: string) => void;
  onAddPrayer: (prayer: FardhuPrayer, dateInfo: string) => void;
  onDeletePrayer: (id: string) => void;
  onToggleGoal: (id: string) => void;
  onAddGoal: (text: string, category: string) => void;
  onDeleteGoal: (id: string) => void;
  onAddTrip: (trip: Omit<TripLog, 'id'>) => void;
  onAddWorkout: (workout: Omit<WorkoutLog, 'id'>) => void;
}

export const DailyLogView: React.FC<DailyLogViewProps> = ({
  routines,
  prayers,
  goals,
  trips,
  workouts,
  onToggleRoutine,
  onAddRoutine,
  onDeleteRoutine,
  onTogglePrayer,
  onAddPrayer,
  onDeletePrayer,
  onToggleGoal,
  onAddGoal,
  onDeleteGoal,
  onAddTrip,
  onAddWorkout,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'routine' | 'prayers' | 'goals' | 'trips' | 'workout'>('routine');

  // Modal / Input States
  const [newRoutineText, setNewRoutineText] = useState('');
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Fokus');
  
  // Prayer add modal
  const [showAddPrayerModal, setShowAddPrayerModal] = useState(false);
  const [prayerType, setPrayerType] = useState<FardhuPrayer>('Subuh');
  const [prayerDate, setPrayerDate] = useState('');

  // Trip Form Modal
  const [showTripModal, setShowTripModal] = useState(false);
  const [tripOrigin, setTripOrigin] = useState('Kosan');
  const [tripDest, setTripDest] = useState('');
  const [tripVehicle, setTripVehicle] = useState('Motor');
  const [tripFuel, setTripFuel] = useState('');

  // Workout Form Modal
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutRoutine, setWorkoutRoutine] = useState('');
  const [workoutMins, setWorkoutMins] = useState('30');

  const pendingPrayers = prayers.filter(p => !p.completed);
  const completedRoutines = routines.filter(r => r.completedToday);

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      
      {/* Top Banner / Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        
        <div className="bg-[#FFD000] border-2 sm:border-3 border-black p-3 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow">
          <span className="text-[10px] sm:text-xs font-black uppercase text-black block">Rutinitas Hari Ini</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display font-black text-xl sm:text-2xl text-black font-mono">
              {completedRoutines.length} / {routines.length}
            </span>
          </div>
          <span className="text-[9px] sm:text-[11px] font-bold text-slate-800 block mt-1">
            {Math.round((completedRoutines.length / (routines.length || 1)) * 100)}% Terselesaikan
          </span>
        </div>

        <div className="bg-purple-300 border-2 sm:border-3 border-black p-3 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow">
          <span className="text-[10px] sm:text-xs font-black uppercase text-black block">Catatan Shalat Fardhu</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display font-black text-xl sm:text-2xl text-black font-mono">
              {pendingPrayers.length}
            </span>
          </div>
          <span className="text-[9px] sm:text-[11px] font-bold text-slate-800 block mt-1">
            {prayers.filter(p => p.completed).length} Sudah Diganti
          </span>
        </div>

        <div className="bg-[#A3E635] border-2 sm:border-3 border-black p-3 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow">
          <span className="text-[10px] sm:text-xs font-black uppercase text-black block">Target Harian</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display font-black text-xl sm:text-2xl text-black font-mono">
              {goals.filter(g => g.completed).length} / {goals.length}
            </span>
          </div>
          <span className="text-[9px] sm:text-[11px] font-bold text-slate-800 block mt-1">
            {goals.filter(g => !g.completed).length} Target Berjalan
          </span>
        </div>

        <div className="bg-orange-300 border-2 sm:border-3 border-black p-3 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow">
          <span className="text-[10px] sm:text-xs font-black uppercase text-black block">Log Perjalanan & Workout</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display font-black text-xl sm:text-2xl text-black font-mono">
              {trips.length + workouts.length} Log
            </span>
          </div>
          <span className="text-[9px] sm:text-[11px] font-bold text-slate-800 block mt-1">
            {workouts.length} Latihan Terdata
          </span>
        </div>

      </div>

      {/* Sub Tabs Bar */}
      <div className="bg-white border-2 sm:border-3 border-black p-2 sm:p-3 rounded-xl sm:rounded-2xl comic-shadow">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('routine')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'routine'
                ? 'bg-[#FFD000] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                : 'text-slate-700 hover:text-black hover:bg-slate-100'
            }`}
          >
            📋 Rutinitas Kos
          </button>

          <button
            onClick={() => setActiveSubTab('prayers')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'prayers'
                ? 'bg-purple-300 text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                : 'text-slate-700 hover:text-black hover:bg-slate-100'
            }`}
          >
            <IconMoon className="w-3.5 h-3.5 inline mr-1" />
            Catatan Shalat ({pendingPrayers.length})
          </button>

          <button
            onClick={() => setActiveSubTab('goals')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'goals'
                ? 'bg-[#A3E635] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                : 'text-slate-700 hover:text-black hover:bg-slate-100'
            }`}
          >
            🎯 Target Harian
          </button>

          <button
            onClick={() => setActiveSubTab('trips')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'trips'
                ? 'bg-cyan-300 text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                : 'text-slate-700 hover:text-black hover:bg-slate-100'
            }`}
          >
            <IconMapPin className="w-3.5 h-3.5 inline mr-1" />
            Perjalanan
          </button>

          <button
            onClick={() => setActiveSubTab('workout')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'workout'
                ? 'bg-orange-300 text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                : 'text-slate-700 hover:text-black hover:bg-slate-100'
            }`}
          >
            <IconDumbbell className="w-3.5 h-3.5 inline mr-1" />
            Workout
          </button>
        </div>
      </div>

      {/* TAB 1: Rutinitas Harian */}
      {activeSubTab === 'routine' && (
        <div className="space-y-4">
          {/* Add Routine Input */}
          <div className="bg-white border-2 sm:border-3 border-black p-3 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newRoutineText.trim()) return;
                onAddRoutine(newRoutineText.trim(), 'Kosan');
                setNewRoutineText('');
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newRoutineText}
                onChange={(e) => setNewRoutineText(e.target.value)}
                placeholder="Tambah rutinitas baru (misal: Cek jemuran, buang sampah)..."
                className="flex-1 px-3 py-1.5 sm:py-2 border-2 border-black rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#FFD000]"
              />
              <button
                type="submit"
                className="comic-button bg-[#FFD000] text-black px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-black rounded-xl font-black text-xs uppercase shrink-0"
              >
                <IconPlus className="w-3.5 h-3.5 inline mr-1" />
                Tambah
              </button>
            </form>
          </div>

          {/* Routine List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {routines.map(item => (
              <div
                key={item.id}
                className={`border-2 sm:border-3 border-black rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 transition-all ${
                  item.completedToday 
                    ? 'bg-[#A3E635]/30 border-black' 
                    : 'bg-white comic-shadow-sm'
                }`}
              >
                <button
                  onClick={() => onToggleRoutine(item.id)}
                  className="flex items-center gap-3 text-left flex-1 min-w-0"
                >
                  <div className={`w-6 h-6 rounded-lg border-2 border-black flex items-center justify-center shrink-0 transition-colors ${
                    item.completedToday ? 'bg-[#A3E635] text-black' : 'bg-white'
                  }`}>
                    {item.completedToday && <IconCheck className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className={`text-xs sm:text-sm font-bold block ${
                      item.completedToday ? 'line-through text-slate-500' : 'text-black'
                    }`}>
                      {item.name}
                    </span>
                    <span className="text-[10px] font-black uppercase text-slate-500">
                      {item.category}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => onDeleteRoutine(item.id)}
                  className="text-slate-400 hover:text-red-600 p-1 shrink-0"
                  title="Hapus Rutinitas"
                >
                  <IconTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Catatan Shalat Fardhu */}
      {activeSubTab === 'prayers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border-2 sm:border-3 border-black p-3 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow">
            <div>
              <h3 className="font-display font-black text-sm sm:text-base text-black uppercase">
                CATATAN SHALAT FARDHU YANG TERLEWAT
              </h3>
              <p className="text-[11px] font-bold text-slate-600">
                Tandai selesai jika sudah diqadha / diganti. Data tersimpan di penyimpanan lokal.
              </p>
            </div>
            <button
              onClick={() => setShowAddPrayerModal(true)}
              className="comic-button bg-purple-300 text-black px-3 py-1.5 border-2 border-black rounded-xl font-black text-xs uppercase"
            >
              <IconPlus className="w-3.5 h-3.5 inline mr-1" />
              Catat Shalat
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
            {prayers.map(p => (
              <div
                key={p.id}
                className={`border-2 sm:border-3 border-black rounded-xl p-3 flex items-center justify-between gap-2 ${
                  p.completed ? 'bg-slate-100 opacity-60' : 'bg-white comic-shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => onTogglePrayer(p.id)}
                    className={`w-6 h-6 rounded-lg border-2 border-black flex items-center justify-center shrink-0 ${
                      p.completed ? 'bg-[#A3E635] text-black' : 'bg-white'
                    }`}
                  >
                    {p.completed && <IconCheck className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0">
                    <span className={`font-display font-black text-sm uppercase block ${
                      p.completed ? 'line-through text-slate-500' : 'text-black'
                    }`}>
                      {p.prayer}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 truncate block">
                      {p.dateInfo}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeletePrayer(p.id)}
                  className="text-slate-400 hover:text-red-600 p-1 shrink-0"
                >
                  <IconTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Target Harian */}
      {activeSubTab === 'goals' && (
        <div className="space-y-4">
          <div className="bg-white border-2 sm:border-3 border-black p-3 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newGoalText.trim()) return;
                onAddGoal(newGoalText.trim(), newGoalCategory);
                setNewGoalText('');
              }}
              className="flex gap-2 flex-col sm:flex-row"
            >
              <input
                type="text"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder="Target harian baru (contoh: Belajar 2 jam, rapikan meja kos)..."
                className="flex-1 px-3 py-1.5 sm:py-2 border-2 border-black rounded-xl font-bold text-xs"
              />
              <div className="flex gap-2">
                <select
                  value={newGoalCategory}
                  onChange={(e) => setNewGoalCategory(e.target.value)}
                  className="px-2.5 py-1.5 border-2 border-black rounded-xl font-bold text-xs bg-white"
                >
                  <option value="Fokus">Fokus</option>
                  <option value="Kosan">Kosan</option>
                  <option value="Keuangan">Keuangan</option>
                  <option value="Kesehatan">Kesehatan</option>
                </select>
                <button
                  type="submit"
                  className="comic-button bg-[#A3E635] text-black px-4 py-1.5 border-2 border-black rounded-xl font-black text-xs uppercase"
                >
                  Tambah Target
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-2">
            {goals.map(g => (
              <div
                key={g.id}
                className={`bg-white border-2 sm:border-3 border-black rounded-xl p-3 flex items-center justify-between gap-3 ${
                  g.completed ? 'bg-[#A3E635]/20' : 'comic-shadow-sm'
                }`}
              >
                <button
                  onClick={() => onToggleGoal(g.id)}
                  className="flex items-center gap-2.5 text-left flex-1"
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
        </div>
      )}

      {/* TAB 4: Perjalanan / Trips */}
      {activeSubTab === 'trips' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border-2 sm:border-3 border-black p-3 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow">
            <div>
              <h3 className="font-display font-black text-sm sm:text-base text-black uppercase">
                LOG PERJALANAN / TRIPS
              </h3>
              <p className="text-[11px] font-bold text-slate-600">
                Catat perjalanan harian, biaya BBM, dan tol.
              </p>
            </div>
            <button
              onClick={() => setShowTripModal(true)}
              className="comic-button bg-cyan-300 text-black px-3 py-1.5 border-2 border-black rounded-xl font-black text-xs uppercase"
            >
              <IconPlus className="w-3.5 h-3.5 inline mr-1" />
              Catat Trip
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trips.map(trip => (
              <div key={trip.id} className="bg-white border-2 sm:border-3 border-black rounded-xl p-4 comic-shadow space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase bg-[#FFFDF6] border border-black px-2 py-0.5 rounded">
                    {trip.vehicle} · {trip.status}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500">{trip.date}</span>
                </div>
                <div className="font-display font-black text-sm sm:text-base text-black">
                  {trip.origin} ➔ {trip.destination}
                </div>
                {trip.fuelCost && (
                  <div className="text-xs font-bold text-slate-700">
                    BBM: <span className="font-mono text-black">Rp {trip.fuelCost.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Workout */}
      {activeSubTab === 'workout' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border-2 sm:border-3 border-black p-3 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow">
            <div>
              <h3 className="font-display font-black text-sm sm:text-base text-black uppercase">
                WORKOUT & OLAHRAGA
              </h3>
              <p className="text-[11px] font-bold text-slate-600">
                Log latihan kebugaran, push-up, jogging, dan durasi.
              </p>
            </div>
            <button
              onClick={() => setShowWorkoutModal(true)}
              className="comic-button bg-orange-300 text-black px-3 py-1.5 border-2 border-black rounded-xl font-black text-xs uppercase"
            >
              <IconPlus className="w-3.5 h-3.5 inline mr-1" />
              Catat Latihan
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {workouts.map(w => (
              <div key={w.id} className="bg-white border-2 sm:border-3 border-black rounded-xl p-4 comic-shadow space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-display font-black text-sm sm:text-base text-black uppercase">{w.title}</h4>
                  <span className="text-[10px] font-bold bg-[#FFD000] border border-black px-2 py-0.5 rounded">
                    {w.durationMins} Menit
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700">{w.routine}</p>
                {w.notes && <p className="text-[11px] text-slate-500 italic">"{w.notes}"</p>}
                <div className="text-[10px] font-mono text-slate-400">{w.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Prayer */}
      {showAddPrayerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-4 sm:p-5 max-w-sm w-full space-y-3">
            <h3 className="font-display font-black text-base uppercase text-black">Catat Shalat Terlewat</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Shalat Fardhu</label>
              <select
                value={prayerType}
                onChange={(e) => setPrayerType(e.target.value as FardhuPrayer)}
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs bg-white"
              >
                <option value="Subuh">Subuh</option>
                <option value="Dzuhur">Dzuhur</option>
                <option value="Ashar">Ashar</option>
                <option value="Maghrib">Maghrib</option>
                <option value="Isya">Isya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Keterangan / Tanggal</label>
              <input
                type="text"
                value={prayerDate}
                onChange={(e) => setPrayerDate(e.target.value)}
                placeholder="Contoh: Kemarin malam saat perjalanan"
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddPrayerModal(false)}
                className="px-3 py-1.5 border-2 border-black rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onAddPrayer(prayerType, prayerDate.trim() || 'Baru dicatat');
                  setShowAddPrayerModal(false);
                  setPrayerDate('');
                }}
                className="comic-button bg-purple-300 text-black px-4 py-1.5 border-2 border-black rounded-xl font-black text-xs uppercase"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Trip */}
      {showTripModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-4 sm:p-5 max-w-sm w-full space-y-3">
            <h3 className="font-display font-black text-base uppercase text-black">Catat Perjalanan Baru</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tujuan *</label>
              <input
                type="text"
                required
                value={tripDest}
                onChange={(e) => setTripDest(e.target.value)}
                placeholder="Kampus, Pasar, Kantor, dll."
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kendaraan</label>
                <select
                  value={tripVehicle}
                  onChange={(e) => setTripVehicle(e.target.value)}
                  className="w-full px-2.5 py-2 border-2 border-black rounded-xl font-bold text-xs bg-white"
                >
                  <option value="Motor">Motor</option>
                  <option value="Mobil">Mobil</option>
                  <option value="KRL / Trans">KRL / Bus</option>
                  <option value="Jalan Kaki">Jalan Kaki</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">BBM (IDR)</label>
                <input
                  type="number"
                  value={tripFuel}
                  onChange={(e) => setTripFuel(e.target.value)}
                  placeholder="20000"
                  className="w-full px-2.5 py-2 border-2 border-black rounded-xl font-mono text-xs font-bold"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowTripModal(false)}
                className="px-3 py-1.5 border-2 border-black rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!tripDest.trim()) return;
                  onAddTrip({
                    origin: tripOrigin,
                    destination: tripDest.trim(),
                    vehicle: tripVehicle,
                    fuelCost: tripFuel ? parseFloat(tripFuel) : undefined,
                    status: 'completed',
                    date: new Date().toISOString().split('T')[0]
                  });
                  setShowTripModal(false);
                  setTripDest('');
                  setTripFuel('');
                }}
                className="comic-button bg-cyan-300 text-black px-4 py-1.5 border-2 border-black rounded-xl font-black text-xs uppercase"
              >
                Simpan Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Workout */}
      {showWorkoutModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-4 sm:p-5 max-w-sm w-full space-y-3">
            <h3 className="font-display font-black text-base uppercase text-black">Catat Latihan Workout</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Judul Latihan *</label>
              <input
                type="text"
                required
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                placeholder="Push-up & Core, Jogging, dll."
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Detail Gerakan</label>
              <textarea
                value={workoutRoutine}
                onChange={(e) => setWorkoutRoutine(e.target.value)}
                placeholder="Push-up 3x15, Sit-up 3x20..."
                rows={2}
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Durasi (Menit)</label>
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
                className="comic-button bg-orange-300 text-black px-4 py-1.5 border-2 border-black rounded-xl font-black text-xs uppercase"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
