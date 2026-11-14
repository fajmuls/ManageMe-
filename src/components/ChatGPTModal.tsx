import React, { useState } from 'react';
import { IconBot, IconCopy, IconCheck, IconSheet } from './icons/SvgIcons';
import { getSpreadsheetUrl, getSpreadsheetId } from '../services/googleSheetsAutoSync';
import { ExternalLink } from 'lucide-react';

interface ChatGPTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGoogleSheets?: () => void;
}

/**
 * Inline ChatGPT Bridge (Tanpa pop-up modal & tanpa form tempel teks lama).
 * Fokus langsung membuka chatgpt.com + salin link Google Spreadsheet terpusat.
 */
export const ChatGPTModal: React.FC<ChatGPTModalProps> = ({
  isOpen,
  onClose,
  onOpenGoogleSheets,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const spreadsheetUrl = getSpreadsheetUrl();
  const spreadsheetId = getSpreadsheetId();

  const handleCopySheetLink = () => {
    navigator.clipboard.writeText(spreadsheetUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <section className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-3">
      <div className="bg-white border-2 border-black rounded-xl p-3 sm:p-4 shadow-[3px_3px_0px_#000] space-y-2.5">
        <div className="flex items-center justify-between gap-2 border-b border-black pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#00E5FF] border border-black rounded-lg flex items-center justify-center">
              <IconBot className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="font-display font-black text-xs sm:text-sm uppercase text-black leading-none">
                ChatGPT ↔ Spreadsheet Langsung
              </h3>
              <p className="text-[10px] font-bold text-slate-600">
                Buka aplikasi ChatGPT dan berikan link Spreadsheet Anda untuk edit otomatis.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-0.5 bg-slate-100 border border-black rounded text-[11px] font-black text-black"
          >
            Tutup
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <a
            href="https://chatgpt.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="comic-button bg-[#00E5FF] text-black px-3.5 py-2 rounded-lg border border-black font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000]"
          >
            <IconBot className="w-4 h-4" />
            <span>Buka ChatGPT (chatgpt.com)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleCopySheetLink}
            className="comic-button bg-[#FFD000] text-black px-3.5 py-2 rounded-lg border border-black font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000]"
          >
            {copiedUrl ? <IconCheck className="w-4 h-4 text-green-700" /> : <IconCopy className="w-4 h-4" />}
            <span>{copiedUrl ? 'Link Spreadsheet Tersalin!' : 'Salin Link Spreadsheet'}</span>
          </button>

          {onOpenGoogleSheets && (
            <button
              type="button"
              onClick={onOpenGoogleSheets}
              className="bg-[#A3E635] text-black px-3 py-2 rounded-lg border border-black font-black text-xs uppercase flex items-center justify-center gap-1.5"
            >
              <IconSheet className="w-3.5 h-3.5" />
              <span>Tarik Data Terbaru dari Sheet</span>
            </button>
          )}
        </div>

        <div className="bg-[#FFFDF6] border border-black rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-slate-700 flex items-center justify-between gap-2">
          <span className="truncate">Spreadsheet Aktif: {spreadsheetId}</span>
          <a
            href={spreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 font-bold hover:underline shrink-0"
          >
            Buka Sheet
          </a>
        </div>
      </div>
    </section>
  );
};
