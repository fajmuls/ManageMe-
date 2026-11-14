import React, { useState, useEffect } from 'react';
import { AppVersionState } from '../types/kosman';
import { DEVELOPER_SUGGESTIONS } from '../data/kosmanItems';
import {
  IconSettings,
  IconDownload,
  IconUpload,
  IconAlert,
  IconSparkles,
  IconCheckCircle,
} from './icons/SvgIcons';
import { InlineConfirmBar, InlineNotice } from './InlineUI';
import { PWAInstallButton } from './PWAInstallBanner';
import { Smartphone } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: AppVersionState;
  onUpdateVersions: (newVersions: AppVersionState) => void;
  onResetAllData: () => void;
  allAppData: any;
  onImportAllData: (data: any) => void;
}

/**
 * Panel Pengaturan & Versi menyatu langsung di dalam website (inline in-flow, bukan pop-up).
 * Menggunakan InlineConfirmBar & InlineNotice (zero window.alert / window.confirm).
 */
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
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setEditableVersions(versions);
  }, [versions, isOpen]);

  if (!isOpen) return null;

  const handleSaveVersions = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateVersions(editableVersions);
    setNotice({ type: 'success', text: 'Versi seluruh modul berhasil diperbarui dan disimpan!' });
  };

  const handleExportJSON = () => {
    const backupPayload = {
      app: 'ManageMe!',
      exportDate: new Date().toISOString(),
      versions: editableVersions,
      data: allAppData,
    };

    const jsonStr = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ManageMe_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setNotice({ type: 'success', text: 'File backup JSON ManageMe! berhasil diunduh.' });
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
          setNotice({ type: 'success', text: 'Backup ManageMe! berhasil dipulihkan!' });
        } else if (Array.isArray(parsed)) {
          onImportAllData({ items: parsed });
          setNotice({ type: 'success', text: 'Data inventaris KosMan berhasil diimpor!' });
        } else {
          setNotice({ type: 'error', text: 'Struktur file JSON tidak dikenali.' });
        }
      } catch {
        setNotice({ type: 'error', text: 'Format file JSON tidak valid.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <section className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-3">
      <div className="bg-white border-2 border-black rounded-xl p-4 sm:p-5 shadow-[4px_4px_0px_#000] space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FFD000] border border-black rounded-lg flex items-center justify-center font-black shadow-[1.5px_1.5px_0px_#000]">
              <IconSettings className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm sm:text-base uppercase text-black leading-none">
                PENGATURAN, VERSI & BACKUP APK
              </h3>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                ManageMe! System Core
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 bg-slate-100 border border-black rounded-lg text-xs font-black text-black"
          >
            Tutup
          </button>
        </div>

        {notice && (
          <InlineNotice
            type={notice.type}
            message={notice.text}
            onClose={() => setNotice(null)}
          />
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-black pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('versions')}
            className={`px-3 py-1 rounded-lg text-xs font-black border border-black ${
              activeTab === 'versions' ? 'bg-[#FF4B82] text-white' : 'bg-slate-100 text-slate-800'
            }`}
          >
            Versi Modul
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('suggestions')}
            className={`px-3 py-1 rounded-lg text-xs font-black border border-black ${
              activeTab === 'suggestions' ? 'bg-[#00E5FF] text-black' : 'bg-slate-100 text-slate-800'
            }`}
          >
            Saran Update & Bug
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1 rounded-lg text-xs font-black border border-black ${
              activeTab === 'backup' ? 'bg-[#A3E635] text-black' : 'bg-slate-100 text-slate-800'
            }`}
          >
            Backup & Android APK
          </button>
        </div>

        {/* TAB 1: App Version Management */}
        {activeTab === 'versions' && (
          <div className="space-y-3 text-xs font-bold">
            <p className="text-slate-700 text-[11px] sm:text-xs">
              Nomor versi tiap modul hanya ditampilkan dan dikelola di pengaturan ini:
            </p>

            <form onSubmit={handleSaveVersions} className="space-y-2.5 bg-[#FFFDF6] border-2 border-black p-3 rounded-xl">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { key: 'hub', label: 'Hub OS' },
                  { key: 'kosman', label: 'KosMan' },
                  { key: 'finance', label: 'Keuangan' },
                  { key: 'activities', label: 'Kegiatan' },
                  { key: 'notes', label: 'Catatan' },
                  { key: 'worship', label: 'Waktu Ibadah' },
                ].map((mod) => (
                  <div key={mod.key}>
                    <label className="block text-[10px] text-slate-700 uppercase mb-0.5">
                      {mod.label}:
                    </label>
                    <input
                      type="text"
                      value={(editableVersions as any)[mod.key] || '2.4.1'}
                      onChange={(e) =>
                        setEditableVersions({ ...editableVersions, [mod.key]: e.target.value })
                      }
                      className="w-full px-2 py-1 border border-black rounded-lg font-mono text-xs bg-white"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="comic-button bg-[#FFD000] text-black px-3.5 py-1.5 border border-black rounded-lg font-black text-xs uppercase"
                >
                  Simpan Versi
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Developer Suggestions */}
        {activeTab === 'suggestions' && (
          <div className="space-y-2 text-xs">
            <div className="bg-[#00E5FF]/20 border border-black p-2.5 rounded-xl font-bold text-slate-800 flex items-center gap-2">
              <IconSparkles className="w-4 h-4 text-black shrink-0" />
              <span>Catatan pembaruan v2.4.1 & rekomendasi teknis terbaru:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {DEVELOPER_SUGGESTIONS.map((sug) => (
                <div key={sug.id} className="bg-white border-2 border-black p-2.5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-black text-xs flex items-center gap-1.5">
                      {sug.applied ? (
                        <IconCheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      ) : (
                        <IconAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                      {sug.title}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase border border-black bg-[#FFD000] text-black shrink-0">
                      {sug.impact}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium text-[11px] leading-snug">{sug.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Backup, WebAPK & Inline Reset */}
        {activeTab === 'backup' && (
          <div className="space-y-3 text-xs font-bold">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="comic-button bg-[#00E5FF] text-black p-2.5 rounded-xl border border-black font-black flex items-center justify-center gap-1.5 uppercase text-xs"
              >
                <IconDownload className="w-4 h-4" />
                Ekspor Backup JSON
              </button>

              <label className="comic-button bg-[#A3E635] text-black p-2.5 rounded-xl border border-black font-black flex items-center justify-center gap-1.5 uppercase text-xs cursor-pointer">
                <IconUpload className="w-4 h-4" />
                Impor Backup JSON
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>

            <div className="bg-[#FFFDF6] border-2 border-black p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-black text-xs uppercase text-black flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  Android PWA & WebAPK Packaging
                </h4>
                <span className="text-[9px] font-black bg-[#A3E635] border border-black px-1.5 py-0.5 rounded uppercase">
                  Manifest & SW Ready
                </span>
              </div>
              <PWAInstallButton />
              <div className="bg-white border border-black rounded-lg p-2 text-[10px] font-mono text-slate-800 space-y-0.5">
                <div>1. Deploy aplikasi ke HTTPS URL publik.</div>
                <div>2. Buka <strong>pwabuilder.com</strong>, tempel URL aplikasi Anda.</div>
                <div>3. Pilih <strong>Package for Store → Android (Trusted Web Activity)</strong> untuk mengunduh <code>.apk</code>.</div>
              </div>
            </div>

            <div className="bg-red-50 border-2 border-black p-3 rounded-xl space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-black text-xs uppercase text-red-700">Reset Data Aplikasi:</h4>
                  <p className="text-[11px] text-slate-700 font-medium">
                    Kosongkan seluruh data lokal ke kondisi bersih v2.4.0.
                  </p>
                </div>
                {!confirmReset && (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="comic-button bg-[#FF4B82] text-white px-3 py-1.5 rounded-lg border border-black font-black text-xs uppercase"
                  >
                    Reset Seluruh Data
                  </button>
                )}
              </div>

              {confirmReset && (
                <InlineConfirmBar
                  title="Apakah Anda yakin ingin menghapus dan mereset seluruh data lokal ManageMe!?"
                  description="Semua data KosMan, transaksi Keuangan, Wishlist, Kegiatan, dan Catatan di browser akan dikosongkan. Data di Google Spreadsheet Anda tidak terhapus."
                  confirmLabel="Ya, Reset Sekarang"
                  onConfirm={() => {
                    onResetAllData();
                    setConfirmReset(false);
                    setNotice({ type: 'info', text: 'Seluruh data lokal berhasil direset ke kondisi bersih.' });
                  }}
                  onCancel={() => setConfirmReset(false)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
