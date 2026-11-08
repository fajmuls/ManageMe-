import React, { useState } from 'react';
import { AppVersionState, DeveloperSuggestion } from '../types/kosman';
import { DEVELOPER_SUGGESTIONS } from '../data/kosmanItems';
import { 
  IconSettings, IconCheck, IconDownload, IconUpload, 
  IconAlert, IconSparkles, IconCheckCircle 
} from './icons/SvgIcons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: AppVersionState;
  onUpdateVersions: (newVersions: AppVersionState) => void;
  onResetAllData: () => void;
  allAppData: any;
  onImportAllData: (data: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  versions,
  onUpdateVersions,
  onResetAllData,
  allAppData,
  onImportAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'versions' | 'suggestions' | 'backup'>('versions');
  const [editableVersions, setEditableVersions] = useState<AppVersionState>(versions);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveVersions = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateVersions(editableVersions);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportJSON = () => {
    const backupPayload = {
      app: 'ManageMe!',
      exportDate: new Date().toISOString(),
      versions: editableVersions,
      data: allAppData
    };

    const jsonStr = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ManageMe_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.data) {
          onImportAllData(parsed.data);
          if (parsed.versions) {
            onUpdateVersions(parsed.versions);
            setEditableVersions(parsed.versions);
          }
          alert('Backup ManageMe! berhasil dipulihkan!');
        } else if (Array.isArray(parsed)) {
          // If only kosman items
          onImportAllData({ items: parsed });
          alert('Data inventaris berhasil diimpor!');
        }
      } catch (err) {
        alert('Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-4 sm:p-6 comic-shadow-xl max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#FFD000] border-2 border-black rounded-xl flex items-center justify-center font-black comic-shadow-sm">
              <IconSettings className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg uppercase text-black leading-none">
                PENGATURAN & VERSI APLIKASI
              </h3>
              <span className="text-[10px] font-bold text-slate-500 uppercase">ManageMe! System Core</span>
            </div>
          </div>
          <button onClick={onClose} className="font-bold text-slate-500 hover:text-black text-lg">✕</button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 border-b-2 border-black pb-2">
          <button
            onClick={() => setActiveTab('versions')}
            className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all border sm:border-2 ${
              activeTab === 'versions' ? 'bg-[#FF4B82] text-white border-black comic-shadow-sm' : 'bg-slate-100 border-transparent text-slate-700'
            }`}
          >
            📌 Versi Tiap Modul
          </button>
          
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all border sm:border-2 ${
              activeTab === 'suggestions' ? 'bg-[#00E5FF] text-black border-black comic-shadow-sm' : 'bg-slate-100 border-transparent text-slate-700'
            }`}
          >
            💡 Saran Update & Bug
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all border sm:border-2 ${
              activeTab === 'backup' ? 'bg-[#A3E635] text-black border-black comic-shadow-sm' : 'bg-slate-100 border-transparent text-slate-700'
            }`}
          >
            💾 Backup & Restore
          </button>
        </div>

        {/* TAB 1: App Version Management (Versions ONLY here) */}
        {activeTab === 'versions' && (
          <div className="space-y-3 text-xs font-bold">
            <p className="text-slate-700 text-[11px] sm:text-xs">
              Sesuai instruksi, nomor versi hanya ditampilkan dan dikelola di pengaturan ini. Anda dapat memperbarui versi modul di bawah setiap kali ada update:
            </p>

            <form onSubmit={handleSaveVersions} className="space-y-2.5 bg-[#FFFDF6] border-2 border-black p-3 sm:p-4 rounded-xl">
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[10px] text-slate-700 uppercase mb-0.5">ManageMe! Hub:</label>
                  <input
                    type="text"
                    value={editableVersions.hub || '2.0.0'}
                    onChange={(e) => setEditableVersions({ ...editableVersions, hub: e.target.value })}
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#FF4B82]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-700 uppercase mb-0.5">KosMan (Kosan):</label>
                  <input
                    type="text"
                    value={editableVersions.kosman || '2.0.0'}
                    onChange={(e) => setEditableVersions({ ...editableVersions, kosman: e.target.value })}
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#FF4B82]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-700 uppercase mb-0.5">Keuangan (Finance):</label>
                  <input
                    type="text"
                    value={editableVersions.finance || '2.0.0'}
                    onChange={(e) => setEditableVersions({ ...editableVersions, finance: e.target.value })}
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#FF4B82]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-700 uppercase mb-0.5">Kegiatan & Perjalanan:</label>
                  <input
                    type="text"
                    value={editableVersions.activities || '2.0.0'}
                    onChange={(e) => setEditableVersions({ ...editableVersions, activities: e.target.value })}
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#FF4B82]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-700 uppercase mb-0.5">Catatan (Notes OS):</label>
                  <input
                    type="text"
                    value={editableVersions.notes || '2.0.0'}
                    onChange={(e) => setEditableVersions({ ...editableVersions, notes: e.target.value })}
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#FF4B82]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-700 uppercase mb-0.5">Waktu Ibadah (Shalat):</label>
                  <input
                    type="text"
                    value={editableVersions.worship || '2.0.0'}
                    onChange={(e) => setEditableVersions({ ...editableVersions, worship: e.target.value })}
                    className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#FF4B82]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-slate-500 font-medium">
                  {savedSuccess ? '✅ Versi berhasil disimpan!' : 'Tersimpan otomatis di browser localStorage.'}
                </span>

                <button
                  type="submit"
                  className="comic-button bg-[#FFD000] text-black px-3.5 py-1.5 border-2 border-black rounded-xl font-black text-xs uppercase"
                >
                  Simpan Versi
                </button>
              </div>

            </form>

            <div className="bg-slate-50 border-2 border-black p-3 rounded-xl space-y-1.5 text-xs">
              <h4 className="font-black text-[11px] uppercase text-black">Status 5 Modul & Hub Saat Ini:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] font-mono">
                <div className="p-1.5 bg-white border border-black rounded">
                  Hub: <span className="font-black text-slate-900">v{editableVersions.hub || '2.0.0'}</span>
                </div>
                <div className="p-1.5 bg-white border border-black rounded">
                  KosMan: <span className="font-black text-[#FF4B82]">v{editableVersions.kosman || '2.0.0'}</span>
                </div>
                <div className="p-1.5 bg-white border border-black rounded">
                  Keuangan: <span className="font-black text-[#A3E635]">v{editableVersions.finance || '2.0.0'}</span>
                </div>
                <div className="p-1.5 bg-white border border-black rounded">
                  Kegiatan: <span className="font-black text-[#00E5FF]">v{editableVersions.activities || '2.0.0'}</span>
                </div>
                <div className="p-1.5 bg-white border border-black rounded">
                  Catatan: <span className="font-black text-[#A855F7]">v{editableVersions.notes || '2.0.0'}</span>
                </div>
                <div className="p-1.5 bg-white border border-black rounded">
                  Waktu Ibadah: <span className="font-black text-[#10B981]">v{editableVersions.worship || '2.0.0'}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Developer Update & Bug Fix Suggestions */}
        {activeTab === 'suggestions' && (
          <div className="space-y-2.5 text-xs">
            <div className="bg-[#00E5FF]/20 border-2 border-black p-2.5 rounded-xl font-bold text-slate-800 flex items-center gap-2 text-xs">
              <IconSparkles className="w-4 h-4 text-black shrink-0" />
              <span>
                Catatan rekomendasi & saran update bermanfaat yang ditemukan saat proses update code:
              </span>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {DEVELOPER_SUGGESTIONS.map((sug) => (
                <div key={sug.id} className="bg-white border-2 border-black p-3 rounded-xl space-y-1.5 comic-shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-black text-xs uppercase flex items-center gap-1.5">
                      {sug.applied ? <IconCheckCircle className="w-3.5 h-3.5 text-green-600" /> : <IconAlert className="w-3.5 h-3.5 text-amber-600" />}
                      {sug.title}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase border border-black ${
                      sug.impact === 'High' ? 'bg-[#FF4B82] text-white' : 'bg-[#FFD000] text-black'
                    }`}>
                      {sug.impact}
                    </span>
                  </div>

                  <p className="text-slate-700 font-bold text-[11px] leading-relaxed">{sug.description}</p>
                  
                  <div className="bg-[#FFFDF6] border border-black p-1.5 rounded text-[10px] text-slate-900 font-mono">
                    💡 <strong>Saran:</strong> {sug.suggestedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Backup & Restore */}
        {activeTab === 'backup' && (
          <div className="space-y-3 text-xs font-bold">
            <p className="text-slate-700 text-[11px] sm:text-xs">
              Simpan dan pulihkan seluruh data aplikasi ManageMe! (KosMan, Keuangan, Log Harian, Catatan, & Versi) dalam 1 file JSON aman tanpa membutuhkan server eksternal:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleExportJSON}
                className="comic-button bg-[#00E5FF] text-black p-2.5 sm:p-3 rounded-xl border-2 border-black font-black flex items-center justify-center gap-1.5 uppercase text-xs"
              >
                <IconDownload className="w-4 h-4" />
                Ekspor Backup JSON
              </button>

              <label className="comic-button bg-[#A3E635] text-black p-2.5 sm:p-3 rounded-xl border-2 border-black font-black flex items-center justify-center gap-1.5 uppercase text-xs cursor-pointer">
                <IconUpload className="w-4 h-4" />
                Impor Backup JSON
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>

            <div className="bg-red-50 border-2 border-black p-3 rounded-xl space-y-1.5">
              <h4 className="font-black text-xs uppercase text-red-700">Reset Data Pabrik:</h4>
              <p className="text-[11px] text-slate-700 font-medium">
                Kembalikan seluruh modul ke dataset awal default ManageMe!:
              </p>
              <button
                onClick={() => {
                  if (window.confirm('Apakah Anda yakin ingin mereset seluruh data ManageMe! ke pengaturan awal?')) {
                    onResetAllData();
                    onClose();
                  }
                }}
                className="comic-button bg-[#FF4B82] text-white px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs uppercase"
              >
                Reset Seluruh Data
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
