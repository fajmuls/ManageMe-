import { KosItem, KosCategory, DeveloperSuggestion } from '../types/kosman';

export const KOS_CATEGORIES: { name: KosCategory; subCategories: string[] }[] = [
  {
    name: 'Makanan',
    subCategories: ['Frozen Food & Siap Saji', 'Mie & Karbo', 'Roti & Selai', 'Biskuit & Wafer', 'Keripik & Snack', 'Es Krim']
  },
  {
    name: 'Minuman',
    subCategories: ['Air Minum', 'Kopi & Teh', 'Susu', 'Minuman Segar & Isotonik']
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

export const INITIAL_KOS_ITEMS: KosItem[] = [
  // ==================== BUMBU DAPUR ====================
  { id: 'bd-1', name: 'Masako', category: 'Bumbu Dapur', tags: ['Bumbu Dapur', 'Belanja'], subCategory: 'Penyedap', quantity: 0, unit: 'bungkus', price: 11000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-2', name: 'Royco', category: 'Bumbu Dapur', tags: ['Bumbu Dapur', 'Belanja'], subCategory: 'Penyedap', quantity: 0, unit: 'bungkus', price: 11500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-3', name: 'Micin Sasa', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Penyedap', quantity: 0, unit: 'bungkus', price: 5000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-4', name: 'Kaldu Jamur Totole', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Penyedap', quantity: 0, unit: 'bungkus', price: 17000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-5', name: 'Garam Dapur', category: 'Bumbu Dapur', tags: ['Bumbu Dapur', 'Keperluan Rumah Tangga'], subCategory: 'Penyedap', quantity: 0, unit: 'bungkus', price: 3500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-6', name: 'Gula Pasir', category: 'Bumbu Dapur', tags: ['Bumbu Dapur', 'Minuman'], subCategory: 'Penyedap', quantity: 0, unit: 'bungkus', price: 18500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-7', name: 'Gula Merah', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Penyedap', quantity: 0, unit: 'bungkus', price: 14000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  { id: 'bd-8', name: 'Minyak Goreng', category: 'Bumbu Dapur', tags: ['Bumbu Dapur', 'Keperluan Rumah Tangga', 'Belanja'], subCategory: 'Minyak & Margarin', quantity: 0, unit: 'pouch', price: 38000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-9', name: 'Margarin Blueband', category: 'Bumbu Dapur', tags: ['Bumbu Dapur', 'Makanan'], subCategory: 'Minyak & Margarin', quantity: 0, unit: 'sachet', price: 10500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-10', name: 'Minyak Wijen', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Minyak & Margarin', quantity: 0, unit: 'botol', price: 34000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  { id: 'bd-11', name: 'Kecap Manis', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Kecap & Saus', quantity: 0, unit: 'pouch', price: 24000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-12', name: 'Kecap Asin', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Kecap & Saus', quantity: 0, unit: 'botol', price: 8000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-13', name: 'Saus Sambal', category: 'Bumbu Dapur', tags: ['Bumbu Dapur', 'Makanan'], subCategory: 'Kecap & Saus', quantity: 0, unit: 'botol', price: 16000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-14', name: 'Saus Tomat', category: 'Bumbu Dapur', tags: ['Bumbu Dapur', 'Makanan'], subCategory: 'Kecap & Saus', quantity: 0, unit: 'botol', price: 13000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-15', name: 'Saus Tiram', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Kecap & Saus', quantity: 0, unit: 'botol', price: 19000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-16', name: 'Saus Teriyaki', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Kecap & Saus', quantity: 0, unit: 'botol', price: 19500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  { id: 'bd-17', name: 'Cabai Rawit', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'bungkus', price: 9000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-18', name: 'Bawang Merah', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'bungkus', price: 12000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-19', name: 'Bawang Putih', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'bungkus', price: 11000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-20', name: 'Bawang Bombay', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'buah', price: 9000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-21', name: 'Lada Putih Bubuk', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'sachet', price: 3000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-22', name: 'Ketumbar Bubuk', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'sachet', price: 3000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-23', name: 'Kunyit Bubuk', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'sachet', price: 3000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-24', name: 'Terasi Udang', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'bungkus', price: 8000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-25', name: 'Santan Sachet', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'sachet', price: 3500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-26', name: 'Cuka Dapur', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'botol', price: 5000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  { id: 'bd-35', name: 'Tepung Terigu', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Tepung & Pengembang', quantity: 0, unit: 'bungkus', price: 13000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-36', name: 'Tepung Tapioka', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Tepung & Pengembang', quantity: 0, unit: 'bungkus', price: 8500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-37', name: 'Tepung Maizena', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Tepung & Pengembang', quantity: 0, unit: 'bungkus', price: 6500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-38', name: 'Tepung Bumbu Serbaguna', category: 'Bumbu Dapur', tags: ['Bumbu Dapur'], subCategory: 'Tepung & Pengembang', quantity: 0, unit: 'bungkus', price: 6000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // ==================== MAKANAN (Multi-tag dengan Keperluan Rumah Tangga / Belanja) ====================
  { id: 'bd-27', name: 'Mi Goreng', category: 'Makanan', tags: ['Makanan', 'Keperluan Rumah Tangga', 'Belanja'], subCategory: 'Mie & Karbo', quantity: 0, unit: 'bungkus', price: 3100, timesPurchased: 0, totalSpend: 0, minThreshold: 3 },
  { id: 'bd-28', name: 'Mi Soto Ayam', category: 'Makanan', tags: ['Makanan', 'Belanja'], subCategory: 'Mie & Karbo', quantity: 0, unit: 'bungkus', price: 3000, timesPurchased: 0, totalSpend: 0, minThreshold: 2 },
  { id: 'bd-29', name: 'Mi Soto Kari', category: 'Makanan', tags: ['Makanan'], subCategory: 'Mie & Karbo', quantity: 0, unit: 'bungkus', price: 3200, timesPurchased: 0, totalSpend: 0, minThreshold: 2 },
  { id: 'bd-30', name: 'Mi Kari Ayam', category: 'Makanan', tags: ['Makanan'], subCategory: 'Mie & Karbo', quantity: 0, unit: 'bungkus', price: 3200, timesPurchased: 0, totalSpend: 0, minThreshold: 2 },
  { id: 'bd-31', name: 'Mi Ayam Bawang', category: 'Makanan', tags: ['Makanan'], subCategory: 'Mie & Karbo', quantity: 0, unit: 'bungkus', price: 3000, timesPurchased: 0, totalSpend: 0, minThreshold: 2 },
  { id: 'bd-32', name: 'Beras', category: 'Makanan', tags: ['Makanan', 'Bumbu Dapur', 'Keperluan Rumah Tangga', 'Belanja'], subCategory: 'Mie & Karbo', quantity: 0, unit: 'karung', price: 75000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-33', name: 'Bihun', category: 'Makanan', tags: ['Makanan', 'Bumbu Dapur'], subCategory: 'Mie & Karbo', quantity: 0, unit: 'bungkus', price: 7000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-34', name: 'Soun', category: 'Makanan', tags: ['Makanan', 'Bumbu Dapur'], subCategory: 'Mie & Karbo', quantity: 0, unit: 'bungkus', price: 6500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  { id: 'cm-11', name: 'Nugget Ayam', category: 'Makanan', tags: ['Makanan', 'Keperluan Rumah Tangga', 'Belanja'], subCategory: 'Frozen Food & Siap Saji', quantity: 0, unit: 'bungkus', price: 48000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-12', name: 'Sosis Siap Makan', category: 'Makanan', tags: ['Makanan', 'Keperluan Rumah Tangga'], subCategory: 'Frozen Food & Siap Saji', quantity: 0, unit: 'bungkus', price: 10000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-13', name: 'Bakso Sapi', category: 'Makanan', tags: ['Makanan', 'Bumbu Dapur'], subCategory: 'Frozen Food & Siap Saji', quantity: 0, unit: 'bungkus', price: 46000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-14', name: 'Kentang Goreng Beku', category: 'Makanan', tags: ['Makanan', 'Keinginan'], subCategory: 'Frozen Food & Siap Saji', quantity: 0, unit: 'bungkus', price: 36000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-15', name: 'Dimsum Ayam', category: 'Makanan', tags: ['Makanan', 'Keinginan'], subCategory: 'Frozen Food & Siap Saji', quantity: 0, unit: 'bungkus', price: 38000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  { id: 'cm-16', name: 'Roti Tawar', category: 'Makanan', tags: ['Makanan', 'Belanja'], subCategory: 'Roti & Selai', quantity: 0, unit: 'bungkus', price: 17500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-17', name: 'Selai Cokelat', category: 'Makanan', tags: ['Makanan', 'Keinginan'], subCategory: 'Roti & Selai', quantity: 0, unit: 'jar', price: 42000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-18', name: 'Selai Kacang', category: 'Makanan', tags: ['Makanan'], subCategory: 'Roti & Selai', quantity: 0, unit: 'jar', price: 31000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-19', name: 'Keju Slice', category: 'Makanan', tags: ['Makanan'], subCategory: 'Roti & Selai', quantity: 0, unit: 'bungkus', price: 16500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  { id: 'cm-1', name: 'Es Krim', category: 'Makanan', tags: ['Makanan', 'Keinginan'], subCategory: 'Es Krim', quantity: 0, unit: 'buah', price: 12000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-2', name: 'Es Krim Cone', category: 'Makanan', tags: ['Makanan', 'Keinginan'], subCategory: 'Es Krim', quantity: 0, unit: 'buah', price: 15000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-3', name: 'Es Krim Cup', category: 'Makanan', tags: ['Makanan', 'Keinginan'], subCategory: 'Es Krim', quantity: 0, unit: 'cup', price: 10000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-4', name: 'Oreo', category: 'Makanan', tags: ['Makanan', 'Keinginan'], subCategory: 'Biskuit & Wafer', quantity: 0, unit: 'bungkus', price: 9500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-5', name: 'Wafer Cokelat', category: 'Makanan', tags: ['Makanan', 'Keinginan'], subCategory: 'Biskuit & Wafer', quantity: 0, unit: 'bungkus', price: 8500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-6', name: 'Biskuit Gandum', category: 'Makanan', tags: ['Makanan'], subCategory: 'Biskuit & Wafer', quantity: 0, unit: 'bungkus', price: 11000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-7', name: 'Keripik Kentang', category: 'Makanan', tags: ['Makanan', 'Keinginan'], subCategory: 'Keripik & Snack', quantity: 0, unit: 'bungkus', price: 11500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-8', name: 'Keripik Singkong', category: 'Makanan', tags: ['Makanan', 'Keinginan'], subCategory: 'Keripik & Snack', quantity: 0, unit: 'bungkus', price: 10000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-9', name: 'Kacang Kulit', category: 'Makanan', tags: ['Makanan', 'Keinginan'], subCategory: 'Keripik & Snack', quantity: 0, unit: 'bungkus', price: 14000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-10', name: 'Cokelat Batang', category: 'Makanan', tags: ['Makanan', 'Keinginan'], subCategory: 'Keripik & Snack', quantity: 0, unit: 'buah', price: 23000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // ==================== MINUMAN ====================
  { id: 'mg-1', name: 'Air Galon', category: 'Minuman', tags: ['Minuman', 'Keperluan Rumah Tangga', 'Belanja'], subCategory: 'Air Minum', quantity: 0, unit: 'galon', price: 20000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-2', name: 'Air Mineral Botol', category: 'Minuman', tags: ['Minuman'], subCategory: 'Air Minum', quantity: 0, unit: 'botol', price: 4000, timesPurchased: 0, totalSpend: 0, minThreshold: 2 },
  { id: 'mg-3', name: 'Kopi Hitam', category: 'Minuman', tags: ['Minuman', 'Keinginan'], subCategory: 'Kopi & Teh', quantity: 0, unit: 'bungkus', price: 28000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-4', name: 'Kopi Sachet', category: 'Minuman', tags: ['Minuman'], subCategory: 'Kopi & Teh', quantity: 0, unit: 'renteng', price: 16000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-5', name: 'Kopi Instan Jar', category: 'Minuman', tags: ['Minuman', 'Keinginan'], subCategory: 'Kopi & Teh', quantity: 0, unit: 'jar', price: 38500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-6', name: 'Teh Celup', category: 'Minuman', tags: ['Minuman'], subCategory: 'Kopi & Teh', quantity: 0, unit: 'box', price: 9500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-7', name: 'Teh Botol Kemasan', category: 'Minuman', tags: ['Minuman', 'Keinginan'], subCategory: 'Kopi & Teh', quantity: 0, unit: 'botol', price: 4000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-8', name: 'Susu UHT', category: 'Minuman', tags: ['Minuman', 'Kesehatan'], subCategory: 'Susu', quantity: 0, unit: 'kotak', price: 19500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-9', name: 'Susu Beruang Steril', category: 'Minuman', tags: ['Minuman', 'Kesehatan'], subCategory: 'Susu', quantity: 0, unit: 'kaleng', price: 10500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-10', name: 'Susu Kental Manis', category: 'Minuman', tags: ['Minuman', 'Bumbu Dapur'], subCategory: 'Susu', quantity: 0, unit: 'pouch', price: 19500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-11', name: 'Pocari Sweat', category: 'Minuman', tags: ['Minuman', 'Kesehatan'], subCategory: 'Minuman Segar & Isotonik', quantity: 0, unit: 'botol', price: 8500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-12', name: 'Air Kelapa Kemasan', category: 'Minuman', tags: ['Minuman', 'Kesehatan'], subCategory: 'Minuman Segar & Isotonik', quantity: 0, unit: 'kotak', price: 8000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-13', name: 'Minuman Cokelat', category: 'Minuman', tags: ['Minuman', 'Keinginan'], subCategory: 'Minuman Segar & Isotonik', quantity: 0, unit: 'renteng', price: 18500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-14', name: 'Nutrisari', category: 'Minuman', tags: ['Minuman'], subCategory: 'Minuman Segar & Isotonik', quantity: 0, unit: 'renteng', price: 14500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-15', name: 'Minuman Soda', category: 'Minuman', tags: ['Minuman', 'Keinginan'], subCategory: 'Minuman Segar & Isotonik', quantity: 0, unit: 'kaleng', price: 7500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // ==================== KESEHATAN ====================
  { id: 'ok-1', name: 'Obat Nyamuk Spray', category: 'Kesehatan', tags: ['Kesehatan', 'Keperluan Rumah Tangga'], subCategory: 'Obat Nyamuk', quantity: 0, unit: 'kaleng', price: 42000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-2', name: 'Obat Nyamuk Bakar', category: 'Kesehatan', tags: ['Kesehatan', 'Keperluan Rumah Tangga'], subCategory: 'Obat Nyamuk', quantity: 0, unit: 'box', price: 6500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-3', name: 'Obat Nyamuk Elektrik', category: 'Kesehatan', tags: ['Kesehatan', 'Kelistrikan & Kos'], subCategory: 'Obat Nyamuk', quantity: 0, unit: 'set', price: 29500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-4', name: 'Refill Obat Nyamuk', category: 'Kesehatan', tags: ['Kesehatan', 'Keperluan Rumah Tangga'], subCategory: 'Obat Nyamuk', quantity: 0, unit: 'botol', price: 18500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-5', name: 'Lotion Anti Nyamuk', category: 'Kesehatan', tags: ['Kesehatan'], subCategory: 'Obat Nyamuk', quantity: 0, unit: 'tube', price: 9500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-6', name: 'Paracetamol', category: 'Kesehatan', tags: ['Kesehatan'], subCategory: 'Obat Harian & Maag', quantity: 0, unit: 'strip', price: 4500, timesPurchased: 0, totalSpend: 0, minThreshold: 2 },
  { id: 'ok-7', name: 'Bodrex', category: 'Kesehatan', tags: ['Kesehatan'], subCategory: 'Obat Harian & Maag', quantity: 0, unit: 'strip', price: 3500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-8', name: 'Mylanta', category: 'Kesehatan', tags: ['Kesehatan'], subCategory: 'Obat Harian & Maag', quantity: 0, unit: 'strip', price: 9000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-9', name: 'Promag', category: 'Kesehatan', tags: ['Kesehatan'], subCategory: 'Obat Harian & Maag', quantity: 0, unit: 'strip', price: 8500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-10', name: 'Tolak Angin', category: 'Kesehatan', tags: ['Kesehatan'], subCategory: 'Obat Harian & Maag', quantity: 0, unit: 'box', price: 44000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-11', name: 'Obat Batuk', category: 'Kesehatan', tags: ['Kesehatan'], subCategory: 'Obat Harian & Maag', quantity: 0, unit: 'botol', price: 21000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-12', name: 'Obat Flu', category: 'Kesehatan', tags: ['Kesehatan'], subCategory: 'Obat Harian & Maag', quantity: 0, unit: 'strip', price: 4000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-13', name: 'Obat Diare', category: 'Kesehatan', tags: ['Kesehatan'], subCategory: 'Obat Harian & Maag', quantity: 0, unit: 'strip', price: 7000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-14', name: 'Betadine Antiseptik', category: 'Kesehatan', tags: ['Kesehatan'], subCategory: 'P3K & Luka', quantity: 0, unit: 'botol', price: 24500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-15', name: 'Plester Luka', category: 'Kesehatan', tags: ['Kesehatan'], subCategory: 'P3K & Luka', quantity: 0, unit: 'amplop', price: 7500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-16', name: 'Alkohol 70%', category: 'Kesehatan', tags: ['Kesehatan'], subCategory: 'P3K & Luka', quantity: 0, unit: 'botol', price: 8500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-20', name: 'Minyak Kayu Putih', category: 'Kesehatan', tags: ['Kesehatan'], subCategory: 'Minyak & Salep', quantity: 0, unit: 'botol', price: 46000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-21', name: 'Freshcare Aromatherapy', category: 'Kesehatan', tags: ['Kesehatan'], subCategory: 'Minyak & Salep', quantity: 0, unit: 'botol', price: 16000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-22', name: 'Counterpain', category: 'Kesehatan', tags: ['Kesehatan'], subCategory: 'Minyak & Salep', quantity: 0, unit: 'tube', price: 34000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-23', name: 'Koyo Salonpas', category: 'Kesehatan', tags: ['Kesehatan'], subCategory: 'Minyak & Salep', quantity: 0, unit: 'bungkus', price: 8500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-26', name: 'Vitamin C', category: 'Kesehatan', tags: ['Kesehatan'], subCategory: 'Vitamin & Alat Medis', quantity: 0, unit: 'botol', price: 8000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-29', name: 'Masker Medis', category: 'Kesehatan', tags: ['Kesehatan', 'Keperluan Rumah Tangga'], subCategory: 'Vitamin & Alat Medis', quantity: 0, unit: 'box', price: 22000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-30', name: 'Hand Sanitizer', category: 'Kesehatan', tags: ['Kesehatan', 'Kebersihan & Toilet'], subCategory: 'Vitamin & Alat Medis', quantity: 0, unit: 'botol', price: 9000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // ==================== KEBERSIHAN & TOILET ====================
  { id: 'kt-1', name: 'Sabun Mandi Batang', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet', 'Belanja'], subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'buah', price: 5000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-2', name: 'Sabun Mandi Cair', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet', 'Belanja'], subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'pouch', price: 26000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-3', name: 'Shampoo', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet', 'Belanja'], subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'botol', price: 34000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-4', name: 'Pasta Gigi', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet', 'Belanja'], subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'tube', price: 16500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-5', name: 'Sikat Gigi', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet'], subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'buah', price: 6000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-6', name: 'Pembersih Muka', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet'], subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'tube', price: 45000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-7', name: 'Deodorant', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet'], subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'botol', price: 21000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-8', name: 'Pisau Cukur', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet'], subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'buah', price: 15000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-9', name: 'Hand Soap', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet'], subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'botol', price: 21000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-10', name: 'Sabun Cuci Piring', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet', 'Keperluan Rumah Tangga'], subCategory: 'Cuci Piring & Dapur', quantity: 0, unit: 'pouch', price: 14000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-11', name: 'Spons Cuci Piring', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet', 'Keperluan Rumah Tangga'], subCategory: 'Cuci Piring & Dapur', quantity: 0, unit: 'buah', price: 5000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-12', name: 'Kawat Cuci Piring', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet', 'Keperluan Rumah Tangga'], subCategory: 'Cuci Piring & Dapur', quantity: 0, unit: 'buah', price: 4000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-13', name: 'Deterjen Bubuk', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet', 'Keperluan Rumah Tangga', 'Belanja'], subCategory: 'Cuci Pakaian', quantity: 0, unit: 'bungkus', price: 24000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-14', name: 'Deterjen Cair', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet', 'Keperluan Rumah Tangga'], subCategory: 'Cuci Pakaian', quantity: 0, unit: 'pouch', price: 26000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-15', name: 'Pewangi Pakaian', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet'], subCategory: 'Cuci Pakaian', quantity: 0, unit: 'pouch', price: 29000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-17', name: 'Pembersih Lantai', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet', 'Keperluan Rumah Tangga'], subCategory: 'Pembersih Lantai & Toilet', quantity: 0, unit: 'pouch', price: 18000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-18', name: 'Pembersih Kloset', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet'], subCategory: 'Pembersih Lantai & Toilet', quantity: 0, unit: 'botol', price: 23500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-20', name: 'Kapur Barus Toilet', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet'], subCategory: 'Pembersih Lantai & Toilet', quantity: 0, unit: 'bungkus', price: 13000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-21', name: 'Pewangi Ruangan', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet', 'Keperluan Rumah Tangga'], subCategory: 'Pembersih Lantai & Toilet', quantity: 0, unit: 'buah', price: 14500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-22', name: 'Tisu Wajah', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet', 'Keperluan Rumah Tangga', 'Belanja'], subCategory: 'Tisu & Alat Kebersihan', quantity: 0, unit: 'bungkus', price: 14500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-23', name: 'Tisu Toilet', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet'], subCategory: 'Tisu & Alat Kebersihan', quantity: 0, unit: 'roll', price: 5000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-25', name: 'Kantong Plastik Sampah', category: 'Kebersihan & Toilet', tags: ['Kebersihan & Toilet', 'Keperluan Rumah Tangga'], subCategory: 'Tisu & Alat Kebersihan', quantity: 0, unit: 'bungkus', price: 15000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // ==================== KEPERLUAN RUMAH TANGGA ====================
  { id: 'krt-1', name: 'Gas Elpiji 3kg', category: 'Keperluan Rumah Tangga', tags: ['Keperluan Rumah Tangga', 'Bumbu Dapur', 'Kelistrikan & Kos'], subCategory: 'Gas & Masak', quantity: 0, unit: 'tabung', price: 22000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-17', name: 'Gantungan Baju (Hanger)', category: 'Keperluan Rumah Tangga', tags: ['Keperluan Rumah Tangga'], subCategory: 'Perlengkapan Jemuran & Kamar', quantity: 0, unit: 'bungkus', price: 18000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-18', name: 'Jepitan Pakaian', category: 'Keperluan Rumah Tangga', tags: ['Keperluan Rumah Tangga'], subCategory: 'Perlengkapan Jemuran & Kamar', quantity: 0, unit: 'bungkus', price: 15000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-19', name: 'Kabel Ties', category: 'Keperluan Rumah Tangga', tags: ['Keperluan Rumah Tangga'], subCategory: 'Penyimpanan & Plastik', quantity: 0, unit: 'bungkus', price: 16000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-26', name: 'Sapu Ijuk', category: 'Keperluan Rumah Tangga', tags: ['Keperluan Rumah Tangga', 'Kebersihan & Toilet'], subCategory: 'Perlengkapan Jemuran & Kamar', quantity: 0, unit: 'buah', price: 28000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-28', name: 'Kain Pel Mop', category: 'Keperluan Rumah Tangga', tags: ['Keperluan Rumah Tangga', 'Kebersihan & Toilet'], subCategory: 'Perlengkapan Jemuran & Kamar', quantity: 0, unit: 'buah', price: 32000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // ==================== KELISTRIKAN & KOS (Dipisah dari Alat Tulis!) ====================
  { id: 'kk-1', name: 'Token Listrik PLN', category: 'Kelistrikan & Kos', tags: ['Kelistrikan & Kos', 'Keperluan Rumah Tangga'], subCategory: 'Listrik & Token PLN', quantity: 0, unit: 'kali', price: 50000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kk-2', name: 'Iuran Air & Sampah Kos', category: 'Kelistrikan & Kos', tags: ['Kelistrikan & Kos'], subCategory: 'Air & Sewa Kos', quantity: 0, unit: 'bulan', price: 50000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-11', name: 'Stopkontak Kabel', category: 'Kelistrikan & Kos', tags: ['Kelistrikan & Kos', 'Keperluan Rumah Tangga'], subCategory: 'Kelistrikan & Lampu', quantity: 0, unit: 'unit', price: 54000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-12', name: 'Bohlam Lampu LED', category: 'Kelistrikan & Kos', tags: ['Kelistrikan & Kos', 'Keperluan Rumah Tangga'], subCategory: 'Kelistrikan & Lampu', quantity: 0, unit: 'buah', price: 42000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-13', name: 'Baterai AA', category: 'Kelistrikan & Kos', tags: ['Kelistrikan & Kos'], subCategory: 'Kelistrikan & Lampu', quantity: 0, unit: 'bungkus', price: 14000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-14', name: 'Baterai AAA', category: 'Kelistrikan & Kos', tags: ['Kelistrikan & Kos'], subCategory: 'Kelistrikan & Lampu', quantity: 0, unit: 'bungkus', price: 14000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // ==================== ALAT TULIS (Terpisah Murni) ====================
  { id: 'ap-1', name: 'Buku Tulis', category: 'Alat Tulis', tags: ['Alat Tulis'], subCategory: 'Buku & Kertas', quantity: 0, unit: 'buah', price: 5000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-2', name: 'Pulpen Hitam', category: 'Alat Tulis', tags: ['Alat Tulis'], subCategory: 'Pulpen & Pensil', quantity: 0, unit: 'buah', price: 3500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-3', name: 'Pensil 2B', category: 'Alat Tulis', tags: ['Alat Tulis'], subCategory: 'Pulpen & Pensil', quantity: 0, unit: 'buah', price: 4000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-6', name: 'Kertas HVS A4', category: 'Alat Tulis', tags: ['Alat Tulis'], subCategory: 'Buku & Kertas', quantity: 0, unit: 'rim', price: 48000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-7', name: 'Gunting', category: 'Alat Tulis', tags: ['Alat Tulis', 'Keperluan Rumah Tangga'], subCategory: 'Perekat & Potong', quantity: 0, unit: 'buah', price: 12500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-9', name: 'Lakban Bening', category: 'Alat Tulis', tags: ['Alat Tulis', 'Keperluan Rumah Tangga'], subCategory: 'Perekat & Potong', quantity: 0, unit: 'roll', price: 14000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-10', name: 'Sticky Notes', category: 'Alat Tulis', tags: ['Alat Tulis'], subCategory: 'Buku & Kertas', quantity: 0, unit: 'pad', price: 13500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 }
];

export const DEVELOPER_SUGGESTIONS: DeveloperSuggestion[] = [
  {
    id: 'sug-v2-14',
    title: 'Database 2-Arah Google Spreadsheet Target + Rumus Otomatis',
    type: 'feature',
    description: 'Menghubungkan aplikasi langsung ke Google Spreadsheet 1npqZQRi9KLtQBwi2iLohxgZQyjQjWYpirB6oTHvlmYw dengan 5 sheet otomatis (Dashboard_Ringkasan, KosMan_Inventaris, Wishlist_Belanja, Keuangan_Transaksi, Kos_Budget_Simulasi) lengkap dengan rumus SUMIFS, ISOWEEKNUM, status stok, dan filter tabel.',
    impact: 'High',
    suggestedAction: 'Buka modal Google Sheets, login Google, lalu tekan Inisialisasi Schema & Rumus atau Tarik Data ChatGPT.',
    applied: true,
  },
  {
    id: 'sug-v2-15',
    title: 'Multi-Tag Kategori KosMan & Pemisahan Pos Kelistrikan Kos',
    type: 'feature',
    description: 'Memisahkan kategori Kelistrikan & Kos dari Alat Tulis, memisahkan Makanan, Minuman, Bumbu Dapur, Kebersihan & Toilet, Kesehatan, Keperluan Rumah Tangga, serta mendukung multi-tag per item (misal Nugget Ayam masuk Makanan dan Keperluan Rumah Tangga).',
    impact: 'High',
    suggestedAction: 'Gunakan filter kategori atau edit tag item di menu KosMan.',
    applied: true,
  },
  {
    id: 'sug-v2-16',
    title: 'Tab Wishlist & Buying Groceries Auto-Tracking',
    type: 'feature',
    description: 'Menambahkan daftar belanja khusus di KosMan yang dapat menarik barang habis/low secara otomatis, dikelompokkan berdasarkan kategori belanja, dan saat ditandai Sudah Dibeli otomatis menambah stok KosMan serta mencatat transaksi Keuangan.',
    impact: 'High',
    suggestedAction: 'Buka tab Wishlist & Grocery List di modul KosMan.',
    applied: true,
  },
  {
    id: 'sug-v2-17',
    title: 'Tab Simulasi Keuangan, Pemasukan Harian & Budget Kos Mingguan',
    type: 'feature',
    description: 'Menambahkan kalkulator simulasi di modul Keuangan untuk mencatat pemasukan harian, pembagian pos mingguan (Sewa/Listrik Kos, Makan, Belanja, Tabungan Wajib, Keinginan), dan batas belanja aman harian.',
    impact: 'High',
    suggestedAction: 'Buka tab Simulasi & Budget Kos di menu Keuangan.',
    applied: true,
  },
  {
    id: 'sug-v2-18',
    title: 'Bugfix & Upgrade: Model OCR Gemini 4 Hydrogen + PWA Android WebAPK',
    type: 'bugfix',
    description: 'Memperbarui model OCR nota di server dari gemini-3.8-flash menjadi gemini-4-hydrogen dengan responseSchema multi-item, serta melengkapi manifest PWA, Workbox offline, dan ikon maskable PNG agar siap dipasang di Android atau dibungkus menjadi WebAPK.',
    impact: 'High',
    suggestedAction: 'Klik Install App di header atau lihat panduan WebAPK di Pengaturan.',
    applied: true,
  }
];
