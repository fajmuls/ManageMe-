# Fajmuls Daily (Personal OS & Productivity) — Optimization & Feature Plan v2.1

Perbaikan menyeluruh pada antarmuka mobile (Fit-Screen Lock, bebas geser horizontal/zoom), penyederhanaan modul Waktu Ibadah menjadi pratinjau web *full-screen*, otomatisasi Google Sheets API melalui Google Workspace OAuth, serta fitur Pemindai Nota Struk Belanja berbasis AI Gemini Vision.

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan dan preferensi pengguna berdasarkan jawaban klarifikasi:
> 1. **Google Workspace OAuth (Automated Google Sheets)**: Aplikasi akan menggunakan Google Workspace OAuth (`spreadsheets` & `drive.file`) untuk membaca, membuat, dan menyinkronkan spreadsheet secara otomatis tanpa copy/paste manual. Data Kosman, Keuangan, dan Kegiatan akan tersimpan dalam 1 Google Spreadsheet terpadu.
> 2. **Penyederhanaan Waktu Ibadah**: Menghapus widget jadwal shalat native yang terlalu ramai dan menggantinya dengan tampilan **Pratinjau Web Full-Screen** interaktif dari `waktuibadah.vercel.app` disertai tombol pintas "Kunjungi Website".
> 3. **Gemini AI Receipt OCR Scanner**: Di menu Keuangan, pengguna dapat mengunggah atau memfoto nota belanja fisik. Gemini AI Vision (`gemini-3.8-flash`) pada server proxy `/api/gemini/ocr` akan mengekstrak total belanja, tanggal, dan nama toko secara otomatis.
> 4. **Mobile Fit-Screen Lock & Typography Scaling**: Mencegah *horizontal scroll / shift* pada mobile (`overflow-x-hidden`, `user-scalable=no`), memperkecil font dan padding hingga 50% (~2x lebih ringkas), dipertipis border komik, dan menggunakan ikon SVG murni.

---

## 1. Overview & Core Concept

**Fajmuls Daily v2.1** berfokus pada penyempurnaan *User Experience* mobile agar sangat cepat, nyaman dioperasikan satu tangan, dan bebas dari *layout clipping* atau *horizontal overflow*:
- **Viewport Lock & Responsive Scaling**: Mengunci kanvas aplikasi pada lebar perangkat mobile (`width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`) dengan `overflow-x: hidden`. Seluruh kartu, font, tombol, dan padding diperkecil ~2x lipat agar *fit-to-screen* secara elegan.
- **Otomatisasi Database Google Sheets**: Dengan Google Workspace OAuth, aplikasi otomatis membuat spreadsheet baru di Drive pengguna (misal: "Fajmuls Daily OS Database") dan secara real-time mengirimkan setiap baris transaksi keuangan, kegiatan harian, dan item Kosman tanpa perlu copy/paste ID spreadsheet manual.
- **Gemini AI Vision OCR Scanner**: Pengguna tinggal foto atau upload nota/struk belanja -> AI mengekstrak data -> otomatis masuk ke Keuangan + stok Kosman + Google Sheets.
- **Modul Waktu Ibadah Minimalis**: Menampilkan pratinjau web full-screen dari `waktuibadah.vercel.app` secara bersih dan responsif.

---

## 2. User Experience & Visual Design

### A. Mobile Lock & Visual Hierarchy
- **Canvas Rule**: Root `html`, `body`, dan `#root` dikunci dengan `max-w-full overflow-x-hidden touch-pan-y`. Tidak ada elemen yang boleh keluar dari batas layar kanan.
- **Micro Typography & Padding**:
  - Ukuran font judul: Dari `24px-32px` diperkecil menjadi `16px-20px` (mobile).
  - Ukuran font teks isi: Dari `14px-16px` diperkecil menjadi `11px-12px`.
  - Button & Card padding: `py-1 px-2.5` dengan border komik tipis `border-1.5 border-black` dan bayangan lembut `shadow-[2px_2px_0px_#000]`.
- **Pure SVG Icons**: Mengganti seluruh ikon teks/emoji generik dengan set ikon SVG murni yang tajam, ringan, dan seragam.

### B. Alur Pengguna (User Flows)
1. **Perjalanan & Live Trip (Fit-Screen)**: Widget trip di tab Kegiatan tampil ringkas di bagian atas tanpa membuat halaman melebar.
2. **Scan Struk AI di Keuangan**:
   - Klik "Scan Struk (AI OCR)" -> Pilih foto dari galeri/kamera -> Gemini Vision memproses nota -> Form terisi otomatis -> Klik Simpan -> Sinkron ke Kosman & Google Sheets.
3. **Google Sheets Auto-Connect**:
   - Klik "Koneksikan Google Sheets" -> OAuth Popup -> Sistem membuat/membuka file Spreadsheet "Fajmuls Daily Database" -> Seluruh transaksi tersimpan otomatis.
4. **Waktu Ibadah Full-Screen Web Preview**:
   - Membuka tab Waktu Ibadah langsung menampilkan pratinjau web `waktuibadah.vercel.app` dalam kontainer full-height yang nyaman dibaca, plus header aksi untuk membuka langsung di browser.

---

## 3. Technical Architecture & Component Structure

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              Fajmuls Daily App (App.tsx)                               │
│ - Viewport Lock: overflow-x-hidden, touch-pan-y, fit-screen responsive                 │
│ - Google Workspace OAuth Integration (Client-side Firebase Auth / Google Provider)      │
└───────────────────┬────────────────────────────────────────────────┬───────────────────┘
                    │                                                │
                    ▼                                                ▼
┌──────────────────────────────────────┐          ┌──────────────────────────────────────┐
│  Server-Side Proxy Routes (server.ts) │          │     Google Sheets API Sync Engine    │
│  - POST /api/gemini/ocr (Vision AI)  │          │  - Auto-Create "Fajmuls Daily DB"   │
│  - Gemini SDK @google/genai          │          │  - Append Rows: Finance, Kosman, Log │
└──────────────────────────────────────┘          └──────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 5 Modul Antarmuka Ringkas                              │
├───────────────┬───────────────┬──────────────────────┬───────────────┬─────────────────┤
│    KosMan     │   Keuangan    │       Kegiatan       │    Catatan    │  Waktu Ibadah   │
│ - Katalog 0   │ - Auto-Sync   │ - Live Trip Timer    │ - 7 Sub-Modul │ - Full Preview  │
│ - Auto-Add    │ - Gemini OCR  │ - Rutinitas Harian   │ - Brankas PIN │ - Link Website  │
│ - SVG Icons   │ - Sheets Sync │ - Auto-Fin Transport │ - IG Notes    │ - Clean Iframe  │
└───────────────┴───────────────┴──────────────────────┴───────────────┴─────────────────┤
```

---

## 4. Implementation Steps

1. **Update `index.html` & Viewport Lock**:
   - Tambahkan `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">` dan rule global CSS `html, body { overflow-x: hidden; touch-action: pan-y; }`.
2. **Setup OAuth Google Workspace & Google Sheets API**:
   - Aktifkan OAuth scope `https://www.googleapis.com/auth/spreadsheets` dan `https://www.googleapis.com/auth/drive.file`.
   - Buat helper `src/services/googleSheetsAutoSync.ts` yang secara otomatis membuat spreadsheet "Fajmuls Daily Database" dan menambahkan baris data keuangan, kegiatan, dan Kosman.
3. **Backend Express Gemini OCR Route (`server.ts`)**:
   - Tambahkan route `POST /api/gemini/ocr` menggunakan `@google/genai` SDK dengan model `gemini-3.8-flash` untuk menganalisis gambar nota/struk belanja (Base64) dan mengembalikan JSON `{ totalAmount, storeName, date, items: [...] }`.
4. **Penyederhanaan UI Waktu Ibadah (`src/components/WorshipView.tsx`)**:
   - Rombak komponen menjadi pratinjau web full-screen bersih dari `waktuibadah.vercel.app` dengan bar navigasi atas yang minimalis dan tombol tautan langsung.
5. **Kompak & Shrink Typography di Semua Modul**:
   - Perkecil ukuran font, padding tombol, dan border di `Navbar.tsx`, `HubDashboard.tsx`, `KosManView.tsx`, `FinanceView.tsx`, `ActivitiesView.tsx`, `NotesView.tsx`, dan `SettingsModal.tsx`.
   - Pastikan seluruh ikon menggunakan SVG murni dan tidak ada teks/elemen yang terpotong atau memicu *horizontal scrollbar*.
6. **Verifikasi & Build**:
   - Jalankan `compile_applet` dan `lint_applet` untuk memastikan aplikasi bebas galat kompilasi dan siap digunakan.
