import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, Clock, Bell, BellOff, Volume2, 
  ExternalLink, CheckCircle2, Circle, Sparkles, MapPin, 
  ChevronRight, Calendar, Bookmark, Eye, ArrowUpRight
} from 'lucide-react';

interface PrayerTime {
  name: string;
  time: string; // HH:mm
  arabic: string;
  isFardhu: boolean;
}

// Regional prayer schedule presets for Indonesian cities
const CITY_PRESETS: Record<string, { lat: number; lng: number; tz: string; times: Record<string, string> }> = {
  'Jakarta & Sekitarnya': {
    lat: -6.2088,
    lng: 106.8456,
    tz: 'WIB',
    times: {
      Imsak: '04:05',
      Subuh: '04:15',
      Terbit: '05:32',
      Dhuha: '06:01',
      Dzuhur: '11:47',
      Ashar: '15:03',
      Maghrib: '17:58',
      Isya: '19:10'
    }
  },
  'Bandung & Jawa Barat': {
    lat: -6.9175,
    lng: 107.6191,
    tz: 'WIB',
    times: {
      Imsak: '04:02',
      Subuh: '04:12',
      Terbit: '05:29',
      Dhuha: '05:58',
      Dzuhur: '11:44',
      Ashar: '15:01',
      Maghrib: '17:56',
      Isya: '19:08'
    }
  },
  'Surabaya & Jawa Timur': {
    lat: -7.2575,
    lng: 112.7521,
    tz: 'WIB',
    times: {
      Imsak: '03:45',
      Subuh: '03:55',
      Terbit: '05:12',
      Dhuha: '05:41',
      Dzuhur: '11:27',
      Ashar: '14:44',
      Maghrib: '17:39',
      Isya: '18:51'
    }
  },
  'Yogyakarta & Solo': {
    lat: -7.7956,
    lng: 110.3695,
    tz: 'WIB',
    times: {
      Imsak: '03:54',
      Subuh: '04:04',
      Terbit: '05:21',
      Dhuha: '05:50',
      Dzuhur: '11:36',
      Ashar: '14:53',
      Maghrib: '17:48',
      Isya: '19:00'
    }
  },
  'Medan & Sumatera Utara': {
    lat: 3.5952,
    lng: 98.6722,
    tz: 'WIB',
    times: {
      Imsak: '04:47',
      Subuh: '04:57',
      Terbit: '06:14',
      Dhuha: '06:43',
      Dzuhur: '12:18',
      Ashar: '15:37',
      Maghrib: '18:18',
      Isya: '19:30'
    }
  },
  'Makassar & Sulsel': {
    lat: -5.1477,
    lng: 119.4327,
    tz: 'WITA',
    times: {
      Imsak: '04:19',
      Subuh: '04:29',
      Terbit: '05:46',
      Dhuha: '06:15',
      Dzuhur: '11:58',
      Ashar: '15:16',
      Maghrib: '18:07',
      Isya: '19:19'
    }
  }
};

const PRAYER_ORDER = ['Imsak', 'Subuh', 'Terbit', 'Dhuha', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];
const FARDHU_LIST = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];

export function WorshipView() {
  const [selectedCity, setSelectedCity] = useState<string>('Jakarta & Sekitarnya');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showWebPreview, setShowWebPreview] = useState<boolean>(false);
  const [compassHeading, setCompassHeading] = useState<number>(295); // Kiblat Indonesia ~295°

  // Checklist sholat hari ini
  const todayKey = new Date().toISOString().split('T')[0];
  const [completedPrayers, setCompletedPrayers] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`manageme_prayer_checklist_${todayKey}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return { Subuh: false, Dzuhur: false, Ashar: false, Maghrib: false, Isya: false };
  });

  // Target Dzikir / Doa counter mini
  const [dhikrCount, setDhikrCount] = useState<number>(() => {
    const saved = localStorage.getItem(`manageme_dhikr_${todayKey}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem(`manageme_prayer_checklist_${todayKey}`, JSON.stringify(completedPrayers));
  }, [completedPrayers, todayKey]);

  useEffect(() => {
    localStorage.setItem(`manageme_dhikr_${todayKey}`, dhikrCount.toString());
  }, [dhikrCount, todayKey]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio chime for adzan notification test
  const playAdzanChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  };

  const currentCityData = CITY_PRESETS[selectedCity] || CITY_PRESETS['Jakarta & Sekitarnya'];
  const times = currentCityData.times;

  // Calculate Next Prayer and Countdown
  const nextPrayerInfo = useMemo(() => {
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const nowSeconds = currentTime.getSeconds();
    const totalCurrentSeconds = nowMinutes * 60 + nowSeconds;

    for (const name of PRAYER_ORDER) {
      const timeStr = times[name];
      if (!timeStr) continue;
      const [h, m] = timeStr.split(':').map(Number);
      const prayerSeconds = (h * 60 + m) * 60;

      if (prayerSeconds > totalCurrentSeconds) {
        const diffSec = prayerSeconds - totalCurrentSeconds;
        const hoursLeft = Math.floor(diffSec / 3600);
        const minsLeft = Math.floor((diffSec % 3600) / 60);
        const secsLeft = diffSec % 60;

        return {
          name,
          time: timeStr,
          remaining: `${hoursLeft.toString().padStart(2, '0')}:${minsLeft.toString().padStart(2, '0')}:${secsLeft.toString().padStart(2, '0')}`,
          isToday: true
        };
      }
    }

    // If all prayers passed today, next is tomorrow's Subuh
    const subuhStr = times['Subuh'];
    const [sh, sm] = subuhStr.split(':').map(Number);
    const subuhTomorrowSec = (24 * 3600) + (sh * 60 + sm) * 60;
    const diffSec = subuhTomorrowSec - totalCurrentSeconds;
    const hoursLeft = Math.floor(diffSec / 3600);
    const minsLeft = Math.floor((diffSec % 3600) / 60);
    const secsLeft = diffSec % 60;

    return {
      name: 'Subuh (Besok)',
      time: subuhStr,
      remaining: `${hoursLeft.toString().padStart(2, '0')}:${minsLeft.toString().padStart(2, '0')}:${secsLeft.toString().padStart(2, '0')}`,
      isToday: false
    };
  }, [currentTime, times]);

  const togglePrayerCheck = (name: string) => {
    setCompletedPrayers(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const completedCount = FARDHU_LIST.filter(p => completedPrayers[p]).length;
  const progressPercent = Math.round((completedCount / FARDHU_LIST.length) * 100);

  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner & Header */}
      <div className="bg-[#10B981] border-3 border-black shadow-[5px_5px_0px_#000] rounded-xl p-5 sm:p-6 text-black relative overflow-hidden">
        {/* Halftone pattern bg */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-black select-none">
          <Compass className="w-56 h-56" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bg-[#FFD000] text-black border-2 border-black font-black text-xs px-2.5 py-0.5 rounded shadow-[2px_2px_0px_#000] uppercase tracking-wide">
                Modul 5: Waktu Ibadah
              </span>
              <span className="bg-white text-black border-2 border-black font-bold text-xs px-2.5 py-0.5 rounded shadow-[2px_2px_0px_#000]">
                {currentCityData.tz} · Waktu Shalat Presisi
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white drop-shadow-[2px_2px_0px_#000] tracking-tight">
              Jadwal Shalat & Waktu Ibadah
            </h1>
            <p className="text-white font-bold text-xs sm:text-sm mt-1 drop-shadow-[1px_1px_0px_#000]">
              {formattedDate} — Pengingat sholat fardhu, hitung mundur adzan, dan arah kiblat harian.
            </p>
          </div>

          {/* Kota Selector Dropdown (Pop Comic Style) */}
          <div className="flex items-center gap-2 bg-white border-3 border-black p-2 rounded-lg shadow-[3px_3px_0px_#000] self-start md:self-auto">
            <MapPin className="w-5 h-5 text-[#10B981] shrink-0" />
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="bg-transparent font-bold text-xs sm:text-sm text-black focus:outline-none cursor-pointer pr-3"
            >
              {Object.keys(CITY_PRESETS).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Countdown Hero & Official Web Link Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Next Prayer Countdown Card */}
        <div className="lg:col-span-2 bg-[#FFD000] border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-black" />
              <span className="font-black text-sm uppercase tracking-wide">Menuju Shalat Berikutnya</span>
            </div>
            <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded">
              {nextPrayerInfo.name} pukul {nextPrayerInfo.time}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-4 my-2">
            <div>
              <div className="text-xs font-bold text-slate-800 uppercase">Waktu Tersisa</div>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-black tabular-nums">
                {nextPrayerInfo.remaining}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) playAdzanChime();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                  soundEnabled ? 'bg-[#A3E635] text-black' : 'bg-slate-200 text-slate-600'
                }`}
                title="Toggle nada pengingat adzan"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                <span>{soundEnabled ? 'Suara Aktif' : 'Mute'}</span>
              </button>

              <button
                onClick={playAdzanChime}
                className="px-3 py-2 bg-white border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_#000] hover:bg-slate-50 transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                Tes Nada
              </button>
            </div>
          </div>

          <div className="pt-3 border-t-2 border-black/20 text-xs font-bold text-slate-900 flex items-center justify-between">
            <span>Jam saat ini: <strong className="font-mono tabular-nums">{currentTime.toLocaleTimeString('id-ID')}</strong> ({currentCityData.tz})</span>
            <span className="hidden sm:inline">Prioritas shalat tepat waktu membawa ketenangan jiwa.</span>
          </div>
        </div>

        {/* waktuibadah.vercel.app Official Web Card & Web Icon */}
        <div className="bg-[#00E5FF] border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="bg-black text-[#00E5FF] font-black text-[11px] px-2 py-0.5 rounded uppercase tracking-wider">
                Official Web Integration
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] border border-black animate-pulse" />
            </div>

            {/* Official Web Icon & Brand */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
                  <path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
                  <path d="M19 11h2m-1 -1v2" />
                </svg>
              </div>
              <div>
                <h3 className="font-black text-base text-black leading-tight">waktuibadah.vercel.app</h3>
                <p className="text-xs font-bold text-slate-800">Portal Waktu Shalat & Ibadah Terpercaya</p>
              </div>
            </div>

            <p className="text-xs font-bold text-slate-900 leading-relaxed mb-4">
              Website referensi waktu shalat digital Anda. Seluruh jadwal telah disinkronkan secara native ke dalam Fajmuls Daily.
            </p>
          </div>

          <div className="space-y-2">
            <a
              href="https://waktuibadah.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-slate-900 border-2 border-black py-2.5 px-4 rounded-lg text-xs font-black shadow-[3px_3px_0px_#FFD000] transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>Kunjungi waktuibadah.vercel.app</span>
              <ArrowUpRight className="w-4 h-4 text-[#FFD000]" />
            </a>

            <button
              onClick={() => setShowWebPreview(!showWebPreview)}
              className="w-full flex items-center justify-center gap-1.5 bg-white text-black hover:bg-slate-50 border-2 border-black py-1.5 px-3 rounded-lg text-[11px] font-black shadow-[2px_2px_0px_#000] transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showWebPreview ? 'Tutup Pratinjau Web' : 'Buka Pratinjau Cepat Web'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Embedded Quick Preview Drawer (if toggled) */}
      {showWebPreview && (
        <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-xl overflow-hidden p-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF4B82] border border-black" />
              <span className="w-3 h-3 rounded-full bg-[#FFD000] border border-black" />
              <span className="w-3 h-3 rounded-full bg-[#A3E635] border border-black" />
              <span className="text-xs font-black text-black ml-2">Pratinjau Langsung: waktuibadah.vercel.app</span>
            </div>
            <button
              onClick={() => setShowWebPreview(false)}
              className="text-xs font-bold bg-slate-200 hover:bg-slate-300 border border-black px-2 py-0.5 rounded"
            >
              ✕ Tutup
            </button>
          </div>
          <div className="w-full h-96 border-2 border-black rounded-lg overflow-hidden relative bg-slate-100">
            <iframe
              src="https://waktuibadah.vercel.app"
              title="Waktu Ibadah Official Web"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        </div>
      )}

      {/* Grid: 8 Waktu Shalat Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-black text-black flex items-center gap-2">
            <span>Jadwal Lengkap Hari Ini</span>
            <span className="text-xs font-bold bg-[#FF4B82] text-white border-2 border-black px-2 py-0.5 rounded shadow-[2px_2px_0px_#000]">
              {selectedCity}
            </span>
          </h2>
          <span className="text-xs font-bold text-slate-600">Standar Kemenag RI</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {PRAYER_ORDER.map(name => {
            const timeStr = times[name] || '--:--';
            const isFardhu = FARDHU_LIST.includes(name);
            const isNext = nextPrayerInfo.name === name;

            return (
              <div
                key={name}
                className={`border-3 border-black rounded-xl p-3 flex flex-col justify-between transition-all ${
                  isNext
                    ? 'bg-[#FFD000] shadow-[4px_4px_0px_#000] scale-[1.03] ring-2 ring-black'
                    : isFardhu
                    ? 'bg-white shadow-[3px_3px_0px_#000]'
                    : 'bg-slate-50 shadow-[2px_2px_0px_#000]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-black uppercase tracking-tight text-slate-900">
                      {name}
                    </span>
                    {isNext && (
                      <span className="w-2 h-2 rounded-full bg-[#FF4B82] border border-black animate-ping" />
                    )}
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-black tabular-nums">
                    {timeStr}
                  </div>
                </div>

                <div className="mt-2 pt-1 border-t border-black/10 flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span>{isFardhu ? 'Fardhu' : 'Sunnah'}</span>
                  {isFardhu && completedPrayers[name] && (
                    <span className="text-[#10B981] font-black">✓ Selesai</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Section: Checklist Sholat Fardhu & Arah Kiblat Compass */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Checklist Sholat Fardhu Hari Ini */}
        <div className="bg-white border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl p-5">
          <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
            <div>
              <h3 className="font-black text-base text-black flex items-center gap-2">
                <span>Checklist Shalat Fardhu</span>
                <span className="bg-[#A3E635] text-black border border-black font-mono text-xs px-1.5 py-0.2 rounded font-black">
                  {completedCount}/5
                </span>
              </h3>
              <p className="text-xs font-bold text-slate-500">Catat pemenuhan shalat 5 waktu hari ini</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-black font-mono text-[#10B981]">{progressPercent}%</span>
              <div className="w-20 bg-slate-200 border border-black h-2 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-[#10B981] h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {FARDHU_LIST.map(prayerName => {
              const isDone = completedPrayers[prayerName] || false;
              const prayerTime = times[prayerName];

              return (
                <div
                  key={prayerName}
                  onClick={() => togglePrayerCheck(prayerName)}
                  className={`flex items-center justify-between p-3 border-2 border-black rounded-lg cursor-pointer transition-all select-none ${
                    isDone 
                      ? 'bg-[#A3E635]/30 border-black shadow-[2px_2px_0px_#000]' 
                      : 'bg-[#FFFDF6] hover:bg-slate-50 shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-black focus:outline-none">
                      {isDone ? (
                        <CheckCircle2 className="w-6 h-6 text-[#10B981] fill-[#10B981] text-white" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-400" />
                      )}
                    </button>
                    <div>
                      <span className={`text-sm font-black ${isDone ? 'line-through text-slate-500' : 'text-black'}`}>
                        Shalat {prayerName}
                      </span>
                      <span className="text-xs font-bold text-slate-500 ml-2 font-mono">
                        ({prayerTime})
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2 py-0.5 rounded border border-black ${
                    isDone ? 'bg-[#10B981] text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {isDone ? 'Sudah Ditunaikan' : 'Belum'}
                  </span>
                </div>
              );
            })}
          </div>

          {completedCount === 5 && (
            <div className="mt-4 p-3 bg-[#FFD000] border-2 border-black rounded-lg text-center font-black text-xs shadow-[2px_2px_0px_#000]">
              🎉 Alhamdulillah! Seluruh 5 shalat fardhu hari ini telah tuntas ditunaikan.
            </div>
          )}
        </div>

        {/* Kiblat Compass & Mini Dzikir Counter */}
        <div className="space-y-5">
          
          {/* Compass Card */}
          <div className="bg-[#FFFDF6] border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl p-5">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div>
                <h3 className="font-black text-base text-black flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#FF4B82]" />
                  <span>Arah Kiblat (Indonesia)</span>
                </h3>
                <p className="text-xs font-bold text-slate-500">Estimasi arah Ka'bah dari wilayah Indonesia</p>
              </div>
              <span className="bg-[#FF4B82] text-white font-mono font-black text-xs px-2 py-1 rounded border border-black">
                {compassHeading}° Barat Laut
              </span>
            </div>

            <div className="flex items-center justify-center py-4">
              <div className="relative w-36 h-36 rounded-full border-4 border-black bg-white shadow-[4px_4px_0px_#000] flex items-center justify-center">
                {/* Degree markings */}
                <span className="absolute top-1 text-[10px] font-black text-slate-700">U (0°)</span>
                <span className="absolute right-2 text-[10px] font-black text-slate-700">T (90°)</span>
                <span className="absolute bottom-1 text-[10px] font-black text-slate-700">S (180°)</span>
                <span className="absolute left-2 text-[10px] font-black text-slate-700">B (270°)</span>

                {/* Ka'bah Pointer Arrow rotated to ~295 deg */}
                <div 
                  className="w-full h-full absolute inset-0 flex items-center justify-center transition-transform duration-700 pointer-events-none"
                  style={{ transform: `rotate(${compassHeading}deg)` }}
                >
                  <div className="w-1.5 h-16 bg-[#10B981] rounded-full relative flex flex-col items-center">
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-[#10B981] -mt-2" />
                    <div className="w-3 h-3 bg-black rounded-full mt-4" />
                  </div>
                </div>

                <div className="text-center z-10 bg-white/90 p-1 rounded border border-black">
                  <div className="text-[10px] font-black text-[#10B981]">KIBLAT</div>
                  <div className="text-xs font-black font-mono">295°</div>
                </div>
              </div>
            </div>

            <p className="text-[11px] font-bold text-slate-600 text-center">
              Arahkan kompas perangkat Anda ke sudut 295° (Barat Laut / NW) menghadap Ka'bah di Makkah Al-Mukarramah.
            </p>
          </div>

          {/* Mini Dzikir Counter */}
          <div className="bg-[#A855F7] text-white border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-xs uppercase tracking-wide">Tasbih & Dzikir Harian</span>
              <button 
                onClick={() => setDhikrCount(0)}
                className="text-[10px] font-bold bg-white text-black border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]"
              >
                Reset
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-purple-100">Subhanallah · Alhamdulillah · Allahu Akbar</div>
                <div className="text-3xl font-black font-mono tabular-nums text-white mt-1">
                  {dhikrCount} <span className="text-xs font-bold font-sans">kali</span>
                </div>
              </div>

              <button
                onClick={() => setDhikrCount(prev => prev + 1)}
                className="w-14 h-14 bg-[#FFD000] text-black border-2 border-black rounded-xl font-black text-xl shadow-[3px_3px_0px_#000] flex items-center justify-center active:translate-x-0.5 active:translate-y-0.5"
              >
                +1
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
