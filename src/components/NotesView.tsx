import React, { useState } from 'react';
import { NormalNote, IGNote, PersonalNote } from '../types/kosman';
import {
  IconNote,
  IconPlus,
  IconTrash,
  IconMusic,
  IconUser,
  IconSearch,
} from './icons/SvgIcons';
import { InlineDropdown, InlineConfirmBar, PopupModal } from './InlineUI';

interface NotesViewProps {
  normalNotes: NormalNote[];
  igNotes: IGNote[];
  personalNotes: PersonalNote[];
  onAddNormalNote: (title: string, content: string, category: string) => void;
  onDeleteNormalNote: (id: string) => void;
  onAddIGNote: (songTitle: string, content: string) => void;
  onDeleteIGNote: (id: string) => void;
  onAddPersonalNote: (
    personName: string,
    extraNotes: string,
    customFields: { key: string; value: string }[]
  ) => void;
  onDeletePersonalNote: (id: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  normalNotes,
  igNotes,
  personalNotes,
  onAddNormalNote,
  onDeleteNormalNote,
  onAddIGNote,
  onDeleteIGNote,
  onAddPersonalNote,
  onDeletePersonalNote,
}) => {
  const [activeTab, setActiveTab] = useState<'normal' | 'ig' | 'personal'>('normal');
  const [searchQuery, setSearchQuery] = useState('');

  // Inline Expandable Form states (zero fixed inset-0 popups)
  const [showNormalForm, setShowNormalForm] = useState(false);
  const [normalTitle, setNormalTitle] = useState('');
  const [normalContent, setNormalContent] = useState('');
  const [normalCategory, setNormalCategory] = useState('Kosan');

  const [showIGForm, setShowIGForm] = useState(false);
  const [igSong, setIgSong] = useState('');
  const [igContent, setIgContent] = useState('');

  const [showPersonalForm, setShowPersonalForm] = useState(false);
  const [personName, setPersonName] = useState('');
  const [personNotes, setPersonNotes] = useState('');
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' },
  ]);

  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'normal' | 'ig' | 'personal';
    id: string;
    label: string;
  } | null>(null);

  const filteredNormal = normalNotes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIG = igNotes.filter(
    (n) =>
      n.songTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPersonal = personalNotes.filter(
    (p) =>
      p.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.extraNotes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-5 space-y-3 sm:space-y-4">
      {/* Header & Tabs */}
      <div className="bg-white border-2 border-black p-3 rounded-xl comic-shadow space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-[#FFFDF6] border border-black p-1 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('normal')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                activeTab === 'normal'
                  ? 'bg-purple-300 text-black border border-black shadow-[1px_1px_0px_#000]'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              <IconNote className="w-3.5 h-3.5 inline mr-1" />
              Catatan Umum ({normalNotes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ig')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                activeTab === 'ig'
                  ? 'bg-black text-white border border-black shadow-[1px_1px_0px_#000]'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              <IconMusic className="w-3.5 h-3.5 inline mr-1 text-[#FFD000]" />
              IG Music ({igNotes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('personal')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                activeTab === 'personal'
                  ? 'bg-[#00E5FF] text-black border border-black shadow-[1px_1px_0px_#000]'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              <IconUser className="w-3.5 h-3.5 inline mr-1" />
              Brankas Pribadi ({personalNotes.length})
            </button>
          </div>

          <div>
            {activeTab === 'normal' && (
              <button
                type="button"
                onClick={() => setShowNormalForm((v) => !v)}
                className="comic-button bg-purple-300 text-black px-3 py-1.5 rounded-lg border border-black font-black text-xs uppercase flex items-center justify-center gap-1 w-full sm:w-auto"
              >
                <IconPlus className="w-3.5 h-3.5" />
                {showNormalForm ? 'Tutup Form' : 'Tambah Catatan'}
              </button>
            )}

            {activeTab === 'ig' && (
              <button
                type="button"
                onClick={() => setShowIGForm((v) => !v)}
                className="comic-button bg-black text-[#FFD000] px-3 py-1.5 rounded-lg border border-black font-black text-xs uppercase flex items-center justify-center gap-1 w-full sm:w-auto"
              >
                <IconPlus className="w-3.5 h-3.5" />
                {showIGForm ? 'Tutup Form' : 'Tambah IG Note'}
              </button>
            )}

            {activeTab === 'personal' && (
              <button
                type="button"
                onClick={() => setShowPersonalForm((v) => !v)}
                className="comic-button bg-[#00E5FF] text-black px-3 py-1.5 rounded-lg border border-black font-black text-xs uppercase flex items-center justify-center gap-1 w-full sm:w-auto"
              >
                <IconPlus className="w-3.5 h-3.5" />
                {showPersonalForm ? 'Tutup Form' : 'Tambah Data Pribadi'}
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <IconSearch className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari dalam catatan..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#FFFDF6] border-2 border-black rounded-lg font-bold text-xs"
          />
        </div>
      </div>

      {/* Inline Delete Confirm */}
      {confirmDelete && (
        <InlineConfirmBar
          title={`Hapus catatan "${confirmDelete.label}"?`}
          confirmLabel="Ya, Hapus"
          onConfirm={() => {
            if (confirmDelete.type === 'normal') onDeleteNormalNote(confirmDelete.id);
            if (confirmDelete.type === 'ig') onDeleteIGNote(confirmDelete.id);
            if (confirmDelete.type === 'personal') onDeletePersonalNote(confirmDelete.id);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* POP-UP FORM: Normal Note */}
      <PopupModal
        isOpen={activeTab === 'normal' && showNormalForm}
        onClose={() => setShowNormalForm(false)}
        title="Tambah Catatan Baru"
        subtitle="Tulis catatan harian atau pengingat (tersinkron ke Spreadsheet)"
        icon={<IconNote className="w-4 h-4 text-black" />}
        headerBg="bg-purple-300"
        maxWidthClass="max-w-xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!normalTitle.trim() || !normalContent.trim()) return;
            onAddNormalNote(normalTitle.trim(), normalContent.trim(), normalCategory);
            setShowNormalForm(false);
            setNormalTitle('');
            setNormalContent('');
          }}
          className="space-y-2.5 pb-12"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Judul *</label>
              <input
                type="text"
                required
                value={normalTitle}
                onChange={(e) => setNormalTitle(e.target.value)}
                placeholder="Judul catatan"
                className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
              />
            </div>
            <InlineDropdown
              label="Kategori"
              value={normalCategory}
              options={['Kosan', 'Belanja', 'Keuangan', 'Kuliah / Kerja', 'Umum']}
              onChange={setNormalCategory}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Isi Catatan *</label>
            <textarea
              required
              rows={4}
              value={normalContent}
              onChange={(e) => setNormalContent(e.target.value)}
              placeholder="Tulis catatan harian, pengingat, atau tugas di sini..."
              className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowNormalForm(false)}
              className="px-3 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="comic-button bg-purple-300 text-black px-4 py-1.5 border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000]"
            >
              Simpan Catatan
            </button>
          </div>
        </form>
      </PopupModal>

      {/* POP-UP FORM: IG Note */}
      <PopupModal
        isOpen={activeTab === 'ig' && showIGForm}
        onClose={() => setShowIGForm(false)}
        title="Tambah IG Music Note"
        subtitle="Simpan judul lagu beserta lirik atau kutipan favorit"
        icon={<IconMusic className="w-4 h-4 text-black" />}
        headerBg="bg-[#FFD000]"
        maxWidthClass="max-w-lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!igSong.trim()) return;
            onAddIGNote(igSong.trim(), igContent.trim() || '-');
            setShowIGForm(false);
            setIgSong('');
            setIgContent('');
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
              Judul Lagu / Musisi *
            </label>
            <input
              type="text"
              required
              value={igSong}
              onChange={(e) => setIgSong(e.target.value)}
              placeholder="Contoh: Mendarah, About You"
              className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
              Kutipan / Lirik Pendek *
            </label>
            <input
              type="text"
              required
              value={igContent}
              onChange={(e) => setIgContent(e.target.value)}
              placeholder="Tulis lirik atau kata favorit..."
              className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowIGForm(false)}
              className="px-3 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="comic-button bg-black text-[#FFD000] px-4 py-1.5 border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000]"
            >
              Simpan IG Note
            </button>
          </div>
        </form>
      </PopupModal>

      {/* POP-UP FORM: Personal Vault Note */}
      <PopupModal
        isOpen={activeTab === 'personal' && showPersonalForm}
        onClose={() => setShowPersonalForm(false)}
        title="Tambah Data Pribadi"
        subtitle="Simpan info kosan, WiFi, rekening, atau field kunci-nilai lainnya"
        icon={<IconUser className="w-4 h-4 text-black" />}
        headerBg="bg-[#00E5FF]"
        maxWidthClass="max-w-xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!personName.trim()) return;
            const validFields = customFields.filter((f) => f.key.trim() && f.value.trim());
            onAddPersonalNote(personName.trim(), personNotes.trim(), validFields);
            setShowPersonalForm(false);
            setPersonName('');
            setPersonNotes('');
            setCustomFields([{ key: '', value: '' }]);
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">
                Nama / Label Data *
              </label>
              <input
                type="text"
                required
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Misal: Data Kosan, Akun WiFi, Rekening"
                className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Catatan</label>
              <input
                type="text"
                value={personNotes}
                onChange={(e) => setPersonNotes(e.target.value)}
                placeholder="Catatan pelengkap..."
                className="w-full px-2.5 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-700 uppercase">Field Kunci - Nilai</label>
            {customFields.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={f.key}
                  onChange={(e) => {
                    const updated = [...customFields];
                    updated[i].key = e.target.value;
                    setCustomFields(updated);
                  }}
                  placeholder="Nama Kunci (No. HP)"
                  className="w-1/2 px-2.5 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
                />
                <input
                  type="text"
                  value={f.value}
                  onChange={(e) => {
                    const updated = [...customFields];
                    updated[i].value = e.target.value;
                    setCustomFields(updated);
                  }}
                  placeholder="Nilai (0812...)"
                  className="w-1/2 px-2.5 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setCustomFields([...customFields, { key: '', value: '' }])}
              className="text-[11px] font-bold text-blue-700 hover:underline"
            >
              + Tambah Baris Field
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowPersonalForm(false)}
              className="px-3 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="comic-button bg-[#00E5FF] text-black px-4 py-1.5 border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000]"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </PopupModal>

      {/* Normal Notes Grid */}
      {activeTab === 'normal' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {filteredNormal.length === 0 ? (
            <div className="sm:col-span-2 md:col-span-3 bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 text-center text-xs font-bold text-slate-500">
              Belum ada catatan umum. Tekan "Tambah Catatan" untuk menulis catatan baru (tersinkron ke Spreadsheet).
            </div>
          ) : (
            filteredNormal.map((n) => (
              <div
                key={n.id}
                className="bg-white border-2 border-black rounded-xl p-3.5 comic-shadow flex flex-col justify-between space-y-2.5"
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-black uppercase bg-[#FFFDF6] border border-black px-2 py-0.5 rounded">
                      {n.category || 'Umum'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete({ type: 'normal', id: n.id, label: n.title })}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-display font-black text-sm text-black">{n.title}</h4>
                  <p className="text-xs font-bold text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {n.content}
                  </p>
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-400 block pt-1.5 border-t border-slate-100">
                  Terakhir diedit: {new Date(n.updatedAt).toLocaleDateString('id-ID')}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* IG Notes Grid */}
      {activeTab === 'ig' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {filteredIG.length === 0 ? (
            <div className="sm:col-span-2 md:col-span-3 bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 text-center text-xs font-bold text-slate-500">
              Belum ada IG Music Note tersimpan.
            </div>
          ) : (
            filteredIG.map((ig) => (
              <div
                key={ig.id}
                className="bg-[#18181b] text-white border-2 border-black rounded-xl p-3.5 comic-shadow flex flex-col justify-between space-y-2.5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5 bg-black/60 border border-white/20 px-2.5 py-1 rounded-lg text-xs font-bold text-[#FFD000]">
                      <IconMusic className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[160px]">{ig.songTitle}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setConfirmDelete({ type: 'ig', id: ig.id, label: ig.songTitle })}
                      className="text-white/40 hover:text-red-400 p-1"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-sm font-bold text-white leading-relaxed py-1">"{ig.content}"</p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-white/50 font-bold border-t border-white/10 pt-1.5">
                  <span>By @{ig.owner}</span>
                  <span className="font-mono">{new Date(ig.updatedAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Personal Vault Notes Grid */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredPersonal.length === 0 ? (
            <div className="sm:col-span-2 bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 text-center text-xs font-bold text-slate-500">
              Belum ada data pribadi tersimpan.
            </div>
          ) : (
            filteredPersonal.map((pn) => (
              <div
                key={pn.id}
                className="bg-white border-2 border-black rounded-xl p-3.5 comic-shadow space-y-2.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-display font-black text-sm text-black uppercase">{pn.personName}</h4>
                    {pn.extraNotes && <p className="text-xs font-bold text-slate-600">{pn.extraNotes}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmDelete({ type: 'personal', id: pn.id, label: pn.personName })
                    }
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <IconTrash className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-[#FFFDF6] border border-black p-2 rounded-lg space-y-1 text-xs font-bold">
                  {pn.customFields.map((field, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center border-b border-slate-200 pb-1 last:border-none last:pb-0"
                    >
                      <span className="text-slate-500">{field.key}:</span>
                      <span className="font-mono text-black">{field.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
