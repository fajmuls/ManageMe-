import React, { useState } from 'react';
import { NormalNote, IGNote, PersonalNote } from '../types/kosman';
import { 
  IconNote, IconPlus, IconTrash, IconMusic, IconUser, 
  IconSearch, IconEdit, IconCheck 
} from './icons/SvgIcons';

interface NotesViewProps {
  normalNotes: NormalNote[];
  igNotes: IGNote[];
  personalNotes: PersonalNote[];
  onAddNormalNote: (title: string, content: string, category: string) => void;
  onDeleteNormalNote: (id: string) => void;
  onAddIGNote: (songTitle: string, content: string) => void;
  onDeleteIGNote: (id: string) => void;
  onAddPersonalNote: (personName: string, extraNotes: string, customFields: { key: string; value: string }[]) => void;
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

  // Modals state
  const [showNormalModal, setShowNormalModal] = useState(false);
  const [normalTitle, setNormalTitle] = useState('');
  const [normalContent, setNormalContent] = useState('');
  const [normalCategory, setNormalCategory] = useState('Kosan');

  const [showIGModal, setShowIGModal] = useState(false);
  const [igSong, setIgSong] = useState('');
  const [igContent, setIgContent] = useState('');

  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [personName, setPersonName] = useState('');
  const [personNotes, setPersonNotes] = useState('');
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' }
  ]);

  const filteredNormal = normalNotes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIG = igNotes.filter(n =>
    n.songTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPersonal = personalNotes.filter(p =>
    p.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.extraNotes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      
      {/* Header & Tabs */}
      <div className="bg-white border-2 sm:border-3 border-black p-3 sm:p-4 rounded-xl sm:rounded-2xl comic-shadow space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          
          <div className="flex items-center gap-1 bg-[#FFFDF6] border sm:border-2 border-black p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('normal')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'normal'
                  ? 'bg-purple-300 text-black border border-black shadow-[1px_1px_0px_#000]'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              <IconNote className="w-3.5 h-3.5 inline mr-1" />
              Catatan Umum ({normalNotes.length})
            </button>
            <button
              onClick={() => setActiveTab('ig')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ig'
                  ? 'bg-black text-white border border-black shadow-[1px_1px_0px_#000]'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              <IconMusic className="w-3.5 h-3.5 inline mr-1 text-[#FFD000]" />
              IG Music Notes ({igNotes.length})
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'personal'
                  ? 'bg-[#00E5FF] text-black border border-black shadow-[1px_1px_0px_#000]'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              <IconUser className="w-3.5 h-3.5 inline mr-1" />
              Catatan Pribadi ({personalNotes.length})
            </button>
          </div>

          <div>
            {activeTab === 'normal' && (
              <button
                onClick={() => setShowNormalModal(true)}
                className="comic-button bg-purple-300 text-black px-3.5 py-1.5 rounded-xl border sm:border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                <IconPlus className="w-3.5 h-3.5" />
                Tambah Catatan
              </button>
            )}

            {activeTab === 'ig' && (
              <button
                onClick={() => setShowIGModal(true)}
                className="comic-button bg-black text-[#FFD000] px-3.5 py-1.5 rounded-xl border sm:border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                <IconPlus className="w-3.5 h-3.5" />
                Tambah IG Music Note
              </button>
            )}

            {activeTab === 'personal' && (
              <button
                onClick={() => setShowPersonalModal(true)}
                className="comic-button bg-[#00E5FF] text-black px-3.5 py-1.5 rounded-xl border sm:border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                <IconPlus className="w-3.5 h-3.5" />
                Tambah Data Pribadi
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
            className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-[#FFFDF6] border-2 border-black rounded-xl font-bold text-xs"
          />
        </div>
      </div>

      {/* Normal Notes */}
      {activeTab === 'normal' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredNormal.map(n => (
            <div key={n.id} className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-4 comic-shadow flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-black uppercase bg-[#FFFDF6] border border-black px-2 py-0.5 rounded">
                    {n.category || 'Umum'}
                  </span>
                  <button
                    onClick={() => onDeleteNormalNote(n.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <IconTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-display font-black text-base text-black">{n.title}</h4>
                <p className="text-xs font-bold text-slate-700 whitespace-pre-wrap leading-relaxed">{n.content}</p>
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-400 block pt-2 border-t border-slate-100">
                Terakhir diedit: {new Date(n.updatedAt).toLocaleDateString('id-ID')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* IG Notes */}
      {activeTab === 'ig' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredIG.map(ig => (
            <div 
              key={ig.id} 
              className="bg-[#18181b] text-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-4 comic-shadow flex flex-col justify-between space-y-3 relative overflow-hidden"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5 bg-black/60 border border-white/20 px-2.5 py-1 rounded-full text-xs font-bold text-[#FFD000]">
                    <IconMusic className="w-3.5 h-3.5 animate-pulse" />
                    <span className="truncate max-w-[160px]">{ig.songTitle}</span>
                  </div>

                  <button
                    onClick={() => onDeleteIGNote(ig.id)}
                    className="text-white/40 hover:text-red-400 p-1"
                  >
                    <IconTrash className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="py-2">
                  <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                    "{ig.content}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-white/50 font-bold border-t border-white/10 pt-2">
                <span>By @{ig.owner}</span>
                <span className="font-mono">{new Date(ig.updatedAt).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Personal Notes */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredPersonal.map(pn => (
            <div key={pn.id} className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-4 comic-shadow space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-display font-black text-base text-black uppercase">{pn.personName}</h4>
                  {pn.extraNotes && <p className="text-xs font-bold text-slate-600">{pn.extraNotes}</p>}
                </div>
                <button
                  onClick={() => onDeletePersonalNote(pn.id)}
                  className="text-slate-400 hover:text-red-600 p-1"
                >
                  <IconTrash className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-[#FFFDF6] border-2 border-black p-2.5 rounded-xl space-y-1.5 text-xs font-bold">
                {pn.customFields.map((field, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-slate-200 pb-1 last:border-none last:pb-0">
                    <span className="text-slate-500">{field.key}:</span>
                    <span className="font-mono text-black">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Normal Note */}
      {showNormalModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-4 sm:p-5 max-w-md w-full space-y-3">
            <h3 className="font-display font-black text-base uppercase text-black">Tambah Catatan Baru</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Judul *</label>
              <input
                type="text"
                required
                value={normalTitle}
                onChange={(e) => setNormalTitle(e.target.value)}
                placeholder="Judul catatan"
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Isi Catatan *</label>
              <textarea
                required
                rows={4}
                value={normalContent}
                onChange={(e) => setNormalContent(e.target.value)}
                placeholder="Tulis catatan harian, pengingat, atau tugas di sini..."
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowNormalModal(false)} className="px-3 py-1.5 border-2 border-black rounded-xl font-bold text-xs">
                Batal
              </button>
              <button
                onClick={() => {
                  if (!normalTitle.trim() || !normalContent.trim()) return;
                  onAddNormalNote(normalTitle.trim(), normalContent.trim(), normalCategory);
                  setShowNormalModal(false);
                  setNormalTitle('');
                  setNormalContent('');
                }}
                className="comic-button bg-purple-300 text-black px-4 py-1.5 border-2 border-black rounded-xl font-black text-xs uppercase"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add IG Note */}
      {showIGModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-4 sm:p-5 max-w-md w-full space-y-3">
            <h3 className="font-display font-black text-base uppercase text-black">Tambah IG Music Note</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Judul Lagu / Musisi *</label>
              <input
                type="text"
                required
                value={igSong}
                onChange={(e) => setIgSong(e.target.value)}
                placeholder="Contoh: Engkaulah Kamuku, Mendarah, About You"
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kutipan / Catatan Pendek *</label>
              <input
                type="text"
                required
                value={igContent}
                onChange={(e) => setIgContent(e.target.value)}
                placeholder="Tulis lirik atau kata-kata favorit..."
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowIGModal(false)} className="px-3 py-1.5 border-2 border-black rounded-xl font-bold text-xs">
                Batal
              </button>
              <button
                onClick={() => {
                  if (!igSong.trim()) return;
                  onAddIGNote(igSong.trim(), igContent.trim() || '🤍');
                  setShowIGModal(false);
                  setIgSong('');
                  setIgContent('');
                }}
                className="comic-button bg-black text-[#FFD000] px-4 py-1.5 border-2 border-black rounded-xl font-black text-xs uppercase"
              >
                Simpan IG Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Personal Note */}
      {showPersonalModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-4 sm:p-5 max-w-md w-full space-y-3">
            <h3 className="font-display font-black text-base uppercase text-black">Tambah Data Pribadi</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama / Label Data *</label>
              <input
                type="text"
                required
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Misal: Data Kosan, Akun Internet, Rekening"
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Catatan</label>
              <input
                type="text"
                value={personNotes}
                onChange={(e) => setPersonNotes(e.target.value)}
                placeholder="Catatan pelengkap..."
                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Field Kunci - Nilai</label>
              {customFields.map((f, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={f.key}
                    onChange={(e) => {
                      const updated = [...customFields];
                      updated[i].key = e.target.value;
                      setCustomFields(updated);
                    }}
                    placeholder="Nama Kunci (No. HP)"
                    className="w-1/2 px-2.5 py-1.5 border-2 border-black rounded-xl font-bold text-xs"
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
                    className="w-1/2 px-2.5 py-1.5 border-2 border-black rounded-xl font-bold text-xs"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCustomFields([...customFields, { key: '', value: '' }])}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                + Tambah Baris Field
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowPersonalModal(false)} className="px-3 py-1.5 border-2 border-black rounded-xl font-bold text-xs">
                Batal
              </button>
              <button
                onClick={() => {
                  if (!personName.trim()) return;
                  const validFields = customFields.filter(f => f.key.trim() && f.value.trim());
                  onAddPersonalNote(personName.trim(), personNotes.trim(), validFields);
                  setShowPersonalModal(false);
                  setPersonName('');
                  setPersonNotes('');
                  setCustomFields([{ key: '', value: '' }]);
                }}
                className="comic-button bg-[#00E5FF] text-black px-4 py-1.5 border-2 border-black rounded-xl font-black text-xs uppercase"
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
