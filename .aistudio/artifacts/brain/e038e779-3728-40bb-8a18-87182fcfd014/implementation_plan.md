# Fajmuls Daily (Personal Productivity & Life OS) — Pop Comic Edition

Transformasi menyeluruh aplikasi menjadi sistem operasi kehidupan pribadi terpadu bergaya **Neo-Brutalist Pop Comic** dengan 5 modul inti: **Kosman**, **Keuangan**, **Kegiatan (Aktivitas & Perjalanan)**, **Catatan Terpadu (7 Sub-modul)**, dan **Waktu Ibadah (Native + Branding waktuibadah.vercel.app)**, didukung sinkronisasi otomatis transaksi ke stok Kosman & Google Sheets, pembersihan total data awal (katalog bersih tanpa kuantitas, transaksi & rutinitas nol), serta manajemen versi per-modul di menu Pengaturan.

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan dan preferensi pengguna yang telah dikonfirmasi:
> 1. **Modul Waktu Ibadah**: Dibangun secara native langsung di dalam aplikasi (jadwal sholat 5 waktu + Imsak & Dhuha, hitung mundur sholat berikutnya, kompas kiblat, checklist sholat harian, adzan toggle) disertai kartu/ikon resmi tautan web ke `waktuibadah.vercel.app` agar pengguna tidak perlu repot berpindah-pindah tab.
> 2. **Integrasi Keuangan -> Kosman & Google Sheets**: Setiap penambahan transaksi pengeluaran belanja di Keuangan otomatis menyinkronkan stok/riwayat pembelian item Kosman terkait dan siap diekspor/disinkronkan ke baris Google Sheets.
> 3. **Pembersihan Data Awal (Zero-State)**: Seluruh kuantitas item Kosman di-reset ke `0` (hanya mempertahankan struktur katalog dan kategori bersih), seluruh transaksi keuangan di-nol-kan, dan rutinitas di-nol-kan sehingga pengguna memulai lembaran baru tanpa data bawaan yang mengganggu.
> 4. **Gaya Visual Pop Comic Neo-Brutalism**: Border tebal 2–3px hitam pekat (`border-black`), bayangan kontras tajam (`shadow-[4px_4px_0px_#000]`), aksen warna ceria (Kuning Komik `#FFD000`, Pink `#FF4B82`, Cyan `#00E5FF`, Lime `#A3E635`), font display tegas dengan tabular-nums untuk angka, dan dropdown serta modal yang selaras 100% dengan tema.
> 5. **Pemisahan Kegiatan & Perjalanan**: Perjalanan (Trips & Live Tracking dengan timer, GPS kota asal/tujuan, biaya bensin & tol yang otomatis masuk ke Keuangan) kini menyatu di dalam modul Kegiatan, terpisah rapi dari Catatan.
> 6. **Pelacakan Versi Aplikasi & Rekomendasi Developer**: Nomor versi untuk setiap modul (Hub v2.0.0, Kosman v2.0.0, Keuangan v2.0.0, Kegiatan v2.0.0, Catatan v2.0.0, Waktu Ibadah v2.0.0) dikelola secara eksklusif di Pengaturan, disertai panel saran pembaruan & bug fix developer setiap kali ada rilis baru.

---

## 1. Overview & Core Concept

**Fajmuls Daily** adalah *Personal Super-App & Life Operating System* yang menyatukan lima pilar kebutuhan harian seorang individu (anak kos, mahasiswa, profesional mandiri, dan muslim produktif):
1. **Kosman (Kos Manager)**: Katalog cerdas barang kosan (bumbu dapur, obat, kebersihan, galon, cemilan, ATK) dengan status stok (AMAN, LOW, HABIS), ambang batas re-order, riwayat belanja, dan import struk belanja.
2. **Keuangan (Finance OS)**: Pencatatan cash flow harian, dompet (Kas, Bank, E-Wallet), perencanaan anggaran kategori, target tabungan, neraca saldo, grafik visualisasi keuangan, asisten AI pencatat bahasa bebas, OCR scanner struk, dan ekspor Google Sheets.
3. **Kegiatan (Activities & Trips OS)**: Pelacak rutinitas mingguan/bulanan, target harian (Daily Goals), sesi olahraga (Workout Notes), dan pelacak perjalanan darat aktif (Live Trip Tracking dengan timer durasi berjalan, integrasi pengeluaran tol/bensin langsung ke Keuangan).
4. **Catatan Terpadu (Notes OS)**: 7 sub-modul dokumentasi spesifik:
   - Catatan Biasa (Normal Notes - format Markdown)
   - Catatan Instagram (IG Notes - lagu, mood, dan riwayat warna)
   - Catatan Pribadi / Brankas Data (PIN Protection & data kustom)
   - Catatan Olahraga (Gerakan, set, reps, beban kg)
   - Target Harian (To-do checklist berbasis tanggal)
   - Pelacak Qadha Shalat (Missed prayers tracker dengan counter pelunasan)
   - Pelacak Rutinitas Harian (Habit Matrix interaktif)
5. **Waktu Ibadah (Prayer OS)**: Kalkulator jadwal sholat presisi untuk kota-kota di Indonesia, hitung mundur adzan berikutnya, panduan arah kiblat, checklist sholat fardhu hari ini, toggle pengingat suara, serta badge tautan ke `waktuibadah.vercel.app`.

---

## 2. User Experience & Visual Design

### A. Pop Comic Neo-Brutalist Visual Identity
- **Warna Dasar & Kontras**:
  - Background kanvas: Putih gading bersih bernuansa pop `#FFFDF6` (Dark Mode: Slate pekat `#0F172A`).
  - Border: Garis tepi tebal solid hitam pekat `border-2 border-black` hingga `border-3 border-black`.
  - Drop Shadow: Hard comic offset `shadow-[3px_3px_0px_#000]` pada mobile dan `shadow-[5px_5px_0px_#000]` pada desktop.
  - Palet Aksen Pop Komik:
    * Comic Yellow: `#FFD000` (Highlight, fokus, saldo)
    * Comic Pink: `#FF4B82` (Kategori belanja, aksi penting, status perhatian)
    * Electric Cyan: `#00E5FF` (Trips, navigasi, fitur AI)
    * Lime Green: `#A3E635` (Pemasukan, stok aman, checklist selesai)
    * Vibrant Purple: `#A855F7` (Catatan, brankas, personal)
    * Emerald/Teal: `#10B981` (Waktu Ibadah, arah kiblat, adzan)
- **Tipografi**:
  - Font Display: Karakter tegas judul komik dengan gaya semi-condensed tebal.
  - Angka Keuangan & Waktu: Wajib menerapkan `tabular-nums` atau `font-mono` agar angka tersusun rapi tanpa pergeseran layout.
- **Komponen & Micro-Interactions**:
  - Tombol Pop: Efek pegas komik `active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-100`.
  - Speech Bubbles: Balon kata komik untuk notifikasi trip aktif dan saran AI.
  - Dropdown & Modal: Dibungkus dengan border tebal hitam, header pita komik berwarna kontras, dan tombol tutup "X" yang menonjol.

### B. Alur Pengguna (User Flows)
1. **Navigasi Terpusat**: Navbar atas yang ramping dan responsif dengan 5 tombol modul utama (`Kosman`, `Keuangan`, `Kegiatan`, `Catatan`, `Waktu Ibadah`) plus tombol Hub Beranda dan tombol Pengaturan & Versi.
2. **Tambah Transaksi Keuangan dengan Auto-Sync Kosman**:
   - Pengguna membuka tab Keuangan -> klik "Tambah Transaksi".
   - Jika kategori dipilih "Belanja KosMan" atau nama item cocok dengan katalog Kosman, aplikasi otomatis memperbarui jumlah stok di Kosman dan mencatat total spend.
   - Data otomatis tersimpan ke `localStorage` dan siap disinkronkan ke Google Sheets melalui modal integrasi.
3. **Mulai & Selesaikan Perjalanan (Trip OS)**:
   - Di tab Kegiatan (sub-tab Bepergian), klik "Mulai Perjalanan" -> pilih Asal, Tujuan, Kendaraan.
   - Timer berjalan real-time dan floating trip widget muncul di pojok layar.
   - Klik "Selesaikan Perjalanan" -> masukkan biaya tol dan bensin -> otomatis membuat 2 transaksi pengeluaran di menu Keuangan secara instan.
4. **Modul Waktu Ibadah & Brand Link**:
   - Buka tab Waktu Ibadah -> menampilkan waktu sholat hari ini berdasarkan kota yang dipilih (Jakarta, Bandung, Surabaya, Yogyakarta, dll.).
   - Kartu hitung mundur sholat berikutnya dengan progress bar visual.
   - Ikon & kartu branding resmi `waktuibadah.vercel.app` dengan tombol akses langsung dan opsi pratinjau cepat.

---

## 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Zero-State Bersih vs Katalog Lengkap**
  - *Pendekatan Terpilih*: Kuantitas semua item di Kosman di-set menjadi `0` (`quantity: 0`, `totalSpend: 0`), sementara nama barang dan kategori tetap utuh sebagai master katalog. Transaksi keuangan, rutinitas, dan data uji coba lainnya dikosongkan.
  - *Alasan*: Pengguna ingin mengisi data riil milik sendiri dari awal tanpa harus menghapus ratusan dummy data secara manual.
- **Keputusan 2: Modul Waktu Ibadah Terpadu (Native + Web Link)**
  - *Pendekatan Terpilih*: Membangun antarmuka waktu sholat asli berbasis logika astronomi lokal Indonesia di dalam aplikasi, dilengkapi kartu branding dan ikon web yang mengarahkan langsung ke `waktuibadah.vercel.app`.
  - *Alasan*: Menjawab keraguan pengguna ("Atau saya buat baru ya? Menurutmu bagaimana untuk salat ini? Jadi ditambahkan ke sini saja atau bagaimana agar tidak berbentuk website kan jadi tidak pindah-pindah web"). Menjadikannya modul native membuat pengalaman pengguna seragam tanpa lag iframe, sementara tetap mempertahankan atribusi dan tautan ke web aslinya.
- **Keputusan 3: Penyatuan Perjalanan ke Modul Kegiatan**
  - *Pendekatan Terpilih*: Memisahkan perjalanan dari catatan harian dan menggabungkannya ke dalam modul Kegiatan bersama Rutinitas Harian, Target Harian, dan Olahraga.
  - *Alasan*: Perjalanan darat adalah bentuk aktivitas fisik aktif yang memiliki siklus hidup (sedang berjalan, selesai, biaya), selaras dengan kegiatan harian.
- **Keputusan 4: Sinkronisasi Otomatis Keuangan -> Kosman & Sheets**
  - *Pendekatan Terpilih*: Saat transaksi pengeluaran belanja ditambahkan di Keuangan, aplikasi secara otomatis mencocokkan item Kosman dan menambahkan stok serta riwayat pembelian, sekaligus menyiapkannya untuk Google Sheets.
  - *Alasan*: Menghilangkan entri data ganda (tidak perlu mencatat di Keuangan lalu mencatat ulang di Kosman).
- **Keputusan 5: Manajemen Versi Eksklusif di Pengaturan**
  - *Pendekatan Terpilih*: Menempatkan kontrol dan tampilan nomor versi (Hub, Kosman, Keuangan, Kegiatan, Catatan, Waktu Ibadah) di dalam modal Pengaturan, dilengkapi daftar riwayat catatan update & saran developer.
  - *Alasan*: Menjaga antarmuka utama tetap bersih tanpa badge versi yang mengotori navbar, sesuai instruksi pengguna.

---

## 4. Technical Architecture & Data Strategy

### A. Diagram Arsitektur Komponen & Alur Data

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       Fajmuls Daily (App.tsx)                                          │
│  - State Sentral: KosItems, FinanceRecords, Savings, Budgets, Activities, Trips, Notes, Versions       │
│  - Sinkronisasi: localStorage (Auto-save) + Google Sheets Sync Engine + Audio FX Controller             │
└───────────────────────────────────┬───────────────────────────────────┬────────────────────────────────┘
                                    │                                   │
              ┌─────────────────────┼─────────────────────┐             ▼
              ▼                     ▼                     ▼    ┌──────────────────────────────────┐
┌─────────────────────────┐ ┌───────────────┐ ┌───────────────┐│       Settings Modal             │
│    Pop Comic Navbar     │ │ Hub Dashboard │ │ Modul Router  ││ - Versi per-modul (v2.0.0)       │
│ - 5 Modul Tabs + Hub    │ │ - Ringkasan   │ │ (5 Modul OS)  ││ - Developer Suggestion Logs      │
│ - Quick Tools & Setting │ │ - Habit Grid  │ └───────┬───────┘│ - Backup & Restore JSON          │
└─────────────────────────┘ │ - Active Trip │         │        │ - Reset Bersih Data              │
                            └───────────────┘         │        └──────────────────────────────────┘
                                                      │
         ┌───────────────────┬────────────────────────┼────────────────────────┬──────────────────────┐
         ▼                   ▼                        ▼                        ▼                      ▼
┌─────────────────┐ ┌─────────────────┐ ┌───────────────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│     Kosman      │ │    Keuangan     │ │         Kegiatan          │ │     Catatan     │ │  Waktu Ibadah   │
│ - Katalog Bersih│ │ - Transaksi (0) │ │ - Rutinitas Harian        │ │ - 7 Sub-Modul   │ │ - Jadwal Sholat │
│ - Stok & Status │ │ - Budget & Save │ │ - Trip Tracking (Aktif)   │ │ - Brankas PIN   │ │ - Hitung Mundur │
│ - Auto-Sync Fin │ │ - AI Assistant  │ │ - Selesai -> Auto Fin Biaya││ - IG Notes estetik│ - Arah Kiblat   │
│ - Input Cepat   │ │ - Google Sheets │ │ - Daily Goals & Workout   │ │ - Qadha Shalat  │ │ - Link Web Icon │
└─────────────────┘ └─────────────────┘ └───────────────────────────┘ └─────────────────┘ └─────────────────┘
```

### B. Pemetaan Modul & Komponen Baru

1. **`src/types/kosman.ts`**:
   - Memperbarui `ActiveAppView` menjadi: `'hub' | 'kosman' | 'finance' | 'activities' | 'notes' | 'worship'`.
   - Menambahkan tipe `WorshipSchedule`, `PrayerTimeItem`, dan memperbarui `AppVersionState` dengan modul `worship`.
2. **`src/data/initialAppData.ts`**:
   - Mengosongkan data transaksi (`INITIAL_FINANCE_RECORDS = []`), rutinitas (`INITIAL_ROUTINE_ACTIVITIES = []`), target harian, dan trip.
   - Menaikkan versi aplikasi ke `v2.0.0` untuk seluruh modul.
   - Memperbarui daftar saran developer (`DEVELOPER_SUGGESTIONS`) dengan rincian pembaruan versi 2.0.0.
3. **`src/data/kosmanItems.ts`**:
   - Mempertahankan katalog item berkualitas tinggi namun me-reset semua kuantitas menjadi `0` (`quantity: 0`, `totalSpend: 0`, `timesPurchased: 0`).
4. **`src/components/WorshipView.tsx` (Komponen Baru)**:
   - Modul lengkap waktu ibadah: jadwal 5 waktu, imsak, dhuha, countdown timer dinamis, arah kiblat, kartu checklist sholat fardhu, adzan chime/audio toggle.
   - Kartu ikon web resmi `waktuibadah.vercel.app` dengan link external dan drawer preview.
5. **`src/components/ActivitiesView.tsx` (Pembaruan & Penyatuan dari DailyLogView)**:
   - Menggabungkan Kegiatan Harian, Olahraga, dan Bepergian (Trips Tracker).
   - Pengisian form selesai perjalanan otomatis memicu callback `onAddTripExpense(fuelCost, tollCost)` ke modul Keuangan.
6. **`src/components/FinanceView.tsx` (Pembaruan)**:
   - Memastikan form tambah transaksi memiliki deteksi otomatis sinkronisasi ke katalog Kosman jika item adalah bahan pokok kosan.
   - Papan kalkulator mini di form transaksi.
   - Integrasi ekspor ke Google Sheets.
7. **`src/components/SettingsModal.tsx` & `src/components/Navbar.tsx`**:
   - Navbar 5 modul + Hub dalam layout pop komik responsif mobile & desktop.
   - Settings modal dengan input pengubah nomor versi masing-masing modul, status update, dan daftar saran developer terbaru.

---

## 5. Implementation Steps

1. **Struktur Data & Tipe**: Update `src/types/kosman.ts` untuk mendukung 5 modul (tambah `'activities'` dan `'worship'`) dan struktur jadwal ibadah.
2. **Reset Data Default**: Bersihkan data awal di `src/data/initialAppData.ts` dan set kuantitas katalog `src/data/kosmanItems.ts` ke 0.
3. **Modul Waktu Ibadah**: Bangun `src/components/WorshipView.tsx` dengan kalkulator jadwal sholat, countdown, arah kiblat, audio alert, dan tautan ikon `waktuibadah.vercel.app`.
4. **Modul Kegiatan & Perjalanan**: Restrukturisasi `DailyLogView.tsx` menjadi `src/components/ActivitiesView.tsx` dengan Live Trip Tracking dan integrasi otomatis biaya bensin/tol ke Keuangan.
5. **Sinkronisasi Keuangan <-> Kosman**: Tambahkan logika otomatis di `src/App.tsx` dan `FinanceView.tsx` yang secara otomatis mengupdate stok Kosman ketika pengeluaran dibukukan.
6. **Desain Pop Comic & Navbar**: Perbarui `Navbar.tsx`, `HubDashboard.tsx`, dan seluruh komponen form/dropdown agar konsisten dengan gaya Pop Comic neo-brutalism.
7. **Pelacakan Versi & Saran Developer**: Perbarui `SettingsModal.tsx` dengan kontrol versi untuk semua 5 modul + Hub dan riwayat saran developer.
8. **Verifikasi & Build**: Jalankan kompilasi TypeScript (`compile_applet`) dan linting (`lint_applet`) untuk memastikan aplikasi bebas galat dan siap digunakan.
