import React, { useState } from 'react';
import { IconBot, IconCopy, IconCheck, IconSheet } from './icons/SvgIcons';
import { PopupModal } from './InlineUI';
import { getSpreadsheetUrl, getSpreadsheetId } from '../services/googleSheetsAutoSync';
import { ExternalLink } from 'lucide-react';

interface ChatGPTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGoogleSheets?: () => void;
}

/**
 * Pop-Up ChatGPT Bridge menyatu dengan UI Pop Comic ManageMe!.
 * Fokus langsung membuka chatgpt.com + salin link Google Spreadsheet terpusat.
 */
export const ChatGPTModal: React.FC<ChatGPTModalProps> = ({
  isOpen,
  onClose,
  onOpenGoogleSheets,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const spreadsheetUrl = getSpreadsheetUrl();
  const spreadsheetId = getSpreadsheetId();

  const handleCopySheetLink = () => {
    navigator.clipboard.writeText(spreadsheetUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title="ChatGPT ↔ Spreadsheet Langsung"
      subtitle="Buka aplikasi ChatGPT dan berikan link Spreadsheet Anda untuk edit otomatis."
      icon={<IconBot className="w-4 h-4 text-black" />}
      headerBg="bg-[#00E5FF]"
      maxWidthClass="max-w-xl"
    >
      <div className="space-y-3">
        <div className="flex flex-col gap-2">
          <a
            href="https://chatgpt.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="comic-button bg-[#00E5FF] text-black px-3.5 py-2.5 rounded-xl border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000]"
          >
            <IconBot className="w-4 h-4" />
            <span>Buka ChatGPT (chatgpt.com)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleCopySheetLink}
            className="comic-button bg-[#FFD000] text-black px-3.5 py-2.5 rounded-xl border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000]"
          >
            {copiedUrl ? <IconCheck className="w-4 h-4 text-green-700" /> : <IconCopy className="w-4 h-4" />}
            <span>{copiedUrl ? 'Link Spreadsheet Tersalin!' : 'Salin Link Spreadsheet'}</span>
          </button>

          {onOpenGoogleSheets && (
            <button
              type="button"
              onClick={onOpenGoogleSheets}
              className="bg-[#A3E635] text-black px-3.5 py-2.5 rounded-xl border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000]"
            >
              <IconSheet className="w-3.5 h-3.5" />
              <span>Tarik Data Terbaru dari Sheet</span>
            </button>
          )}
        </div>

        <div className="bg-white border-2 border-black rounded-xl px-3 py-2 text-[10px] font-mono text-slate-700 flex items-center justify-between gap-2">
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
    </PopupModal>
  );
};
