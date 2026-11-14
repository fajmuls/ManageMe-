import { KosItem, KosCategory, DeveloperSuggestion } from '../types/kosman';

export const KOS_CATEGORIES: { name: KosCategory; subCategories: string[] }[] = [
  {
    name: 'Makanan',
    subCategories: ['Frozen Food & Siap Saji', 'Mie & Karbo', 'Roti & Selai', 'Biskuit & Wafer', 'Keripik & Snack', 'Es Krim', 'Lauk & Telur']
  },
  {
    name: 'Minuman',
    subCategories: ['Air Minum & Galon', 'Kopi & Teh', 'Susu', 'Minuman Segar & Isotonik']
  },
  {
    name: 'Bumbu Dapur',
    subCategories: ['Penyedap', 'Minyak & Margarin', 'Kecap & Saus', 'Bumbu & Rempah', 'Tepung & Pengembang']
  },
  {
    name: 'Kebersihan & Toilet',
    subCategories: ['Sabun Mandi & Perawatan', 'Cuci Piring & Dapur', 'Cuci Pakaian', 'Pembersih Lantai & Toilet', 'Tisu & Alat Kebersihan']
  },
  {
    name: 'Kesehatan',
    subCategories: ['Obat Harian & Maag', 'P3K & Luka', 'Minyak & Salep', 'Vitamin & Alat Medis', 'Obat Nyamuk']
  },
  {
    name: 'Keperluan Rumah Tangga',
    subCategories: ['Perlengkapan Jemuran & Kamar', 'Penyimpanan & Plastik', 'Gas & Masak']
  },
  {
    name: 'Kelistrikan & Kos',
    subCategories: ['Listrik & Token PLN', 'Air & Sewa Kos', 'Kelistrikan & Lampu']
  },
  {
    name: 'Alat Tulis',
    subCategories: ['Buku & Kertas', 'Pulpen & Pensil', 'Perekat & Potong']
  },
  {
    name: 'Keinginan',
    subCategories: ['Jajan & Hiburan', 'Hobi & Aksesoris', 'Opsional']
  },
  {
    name: 'Belanja',
    subCategories: ['Belanja Bulanan', 'Belanja Mingguan', 'Darurat']
  }
];

export const normalizeKosCategory = (raw: string): KosCategory => {
  const val = (raw || '').trim();
  if (val === 'Obat & Kesehatan') return 'Kesehatan';
  if (val === 'Kebersihan Toilet') return 'Kebersihan & Toilet';
  if (val === 'Minuman & Galon') return 'Minuman';
  if (val === 'Cemilan & Makanan') return 'Makanan';
  if (val === 'Alat Tulis & Kos') return 'Kelistrikan & Kos';
  const valid = KOS_CATEGORIES.find(c => c.name === val);
  return valid ? valid.name : 'Keperluan Rumah Tangga';
};

// Base KosMan dimulai KOSONG agar user menambahkan barangnya sendiri secara bersih,
// atau mengisi otomatis via Scan Nota, Scan Stok, maupun Sinkron Google Spreadsheet.
export const INITIAL_KOS_ITEMS: KosItem[] = [];

export const DEVELOPER_SUGGESTIONS: DeveloperSuggestion[] = [
  {
    id: 'sug-v2-19',
    title: 'Base KosMan Bersih (Zero-Base) + UI Tabel & Riwayat Harga Total',
    type: 'feature',
    description: 'Inventaris awal KosMan kini dimulai kosong dengan struktur 10 kategori & sub-kategori tetap siap pakai. Pencatatan pembelian memakai Qty + Total Harga Keseluruhan dengan riwayat tanggal & jam tepat per barang.',
    impact: 'High',
    suggestedAction: 'Klik + Tambah Barang di KosMan lalu klik baris tabel barang untuk mencatat transaksi pembelian & melihat riwayatnya.',
    applied: true,
  },
  {
    id: 'sug-v2-20',
    title: 'UI 100% Inline Tanpa Pop-up Modal & Tanpa Dropdown Melayang',
    type: 'optimization',
    description: 'Seluruh dropdown, konfirmasi hapus/reset, notifikasi status, panel Set Spreadsheet, dan form input kini membuka ke bawah menyatu dengan website (in-flow) sehingga aman di layar HP dan WebAPK.',
    impact: 'High',
    suggestedAction: 'Gunakan dropdown kategori atau panel Set Spreadsheet yang kini terbuka langsung di bawah tombolnya.',
    applied: true,
  },
  {
    id: 'sug-v2-21',
    title: 'Wishlist Multi-Add, Hapus Massal (Bulk Delete) & ChatGPT Link Langsung',
    type: 'feature',
    description: 'Wishlist mendukung tambah banyak baris sekaligus dan centang hapus massal/kosongkan. Form tempel ChatGPT lama dihapus dan diganti tombol langsung buka chatgpt.com + salin link Spreadsheet.',
    impact: 'High',
    suggestedAction: 'Buka tab Wishlist di KosMan untuk mencoba hapus massal atau klik tombol ChatGPT di bar atas.',
    applied: true,
  },
  {
    id: 'sug-v2-22',
    title: 'Set Spreadsheet Terpusat 9 Tab (Termasuk Kegiatan, Catatan & Waktu Ibadah)',
    type: 'feature',
    description: 'Satu Google Spreadsheet induk kini menyinkronkan seluruh modul: KosMan Inventaris, Riwayat Beli KosMan, Wishlist, Keuangan, Budget Rasio, Kegiatan, Catatan, dan Waktu Ibadah secara otomatis saat online.',
    impact: 'High',
    suggestedAction: 'Klik Set Spreadsheet di bar atas atau Hub untuk menautkan Spreadsheet Anda dan inisialisasi 9 tab otomatis.',
    applied: true,
  },
  {
    id: 'sug-v2-23',
    title: 'Scan Nota & Scan Stok Foto Rak/Kulkas Tersedia di Keuangan & KosMan',
    type: 'feature',
    description: 'AI Scanner (gemini-4-hydrogen) kini hadir di KosMan dan Keuangan dengan 2 mode: Scan Nota Belanja (otomatis catat pengeluaran + tambah stok & riwayat barang) dan Scan Stok (foto rak/barang kos untuk cek & update stok ke Spreadsheet).',
    impact: 'High',
    suggestedAction: 'Tekan tombol Scan Nota / Stok di KosMan atau Keuangan untuk mencoba.',
    applied: true,
  }
];
