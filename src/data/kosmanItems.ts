import { KosItem, KosCategory, DeveloperSuggestion } from '../types/kosman';

export const KOS_CATEGORIES: { name: KosCategory; subCategories: string[] }[] = [
  {
    name: 'Bumbu Dapur',
    subCategories: ['Penyedap', 'Minyak & Margarin', 'Kecap & Saus', 'Bumbu & Rempah', 'Mie & Karbo', 'Tepung & Pengembang']
  },
  {
    name: 'Obat & Kesehatan',
    subCategories: ['Obat Nyamuk', 'Obat Harian & Maag', 'P3K & Luka', 'Minyak & Salep', 'Vitamin & Alat Medis']
  },
  {
    name: 'Kebersihan Toilet',
    subCategories: ['Sabun Mandi & Perawatan', 'Cuci Piring & Dapur', 'Cuci Pakaian', 'Pembersih Lantai & Toilet', 'Tisu & Alat Kebersihan']
  },
  {
    name: 'Minuman & Galon',
    subCategories: ['Air Minum', 'Kopi & Teh', 'Susu', 'Minuman Segar & Isotonik']
  },
  {
    name: 'Cemilan & Makanan',
    subCategories: ['Es Krim', 'Biskuit & Wafer', 'Keripik & Snack', 'Frozen Food & Siap Saji', 'Roti & Selai']
  },
  {
    name: 'Alat Tulis & Kos',
    subCategories: ['Alat Tulis', 'Kelistrikan & Kamar', 'Perlengkapan Jemuran & Kos']
  }
];

export const INITIAL_KOS_ITEMS: KosItem[] = [
  // ==================== BUMBU DAPUR ====================
  // Penyedap (Masako dipisah, Royco dipisah, tanpa rasa)
  { id: 'bd-1', name: 'Masako', category: 'Bumbu Dapur', subCategory: 'Penyedap', quantity: 0, unit: 'bungkus', price: 11000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-2', name: 'Royco', category: 'Bumbu Dapur', subCategory: 'Penyedap', quantity: 0, unit: 'bungkus', price: 11500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-3', name: 'Micin Sasa', category: 'Bumbu Dapur', subCategory: 'Penyedap', quantity: 0, unit: 'bungkus', price: 5000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-4', name: 'Kaldu Jamur Totole', category: 'Bumbu Dapur', subCategory: 'Penyedap', quantity: 0, unit: 'bungkus', price: 17000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-5', name: 'Garam Dapur', category: 'Bumbu Dapur', subCategory: 'Penyedap', quantity: 0, unit: 'bungkus', price: 3500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-6', name: 'Gula Pasir', category: 'Bumbu Dapur', subCategory: 'Penyedap', quantity: 0, unit: 'bungkus', price: 18500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-7', name: 'Gula Merah', category: 'Bumbu Dapur', subCategory: 'Penyedap', quantity: 0, unit: 'bungkus', price: 14000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Minyak & Margarin
  { id: 'bd-8', name: 'Minyak Goreng', category: 'Bumbu Dapur', subCategory: 'Minyak & Margarin', quantity: 0, unit: 'pouch', price: 38000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-9', name: 'Margarin Blueband', category: 'Bumbu Dapur', subCategory: 'Minyak & Margarin', quantity: 0, unit: 'sachet', price: 10500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-10', name: 'Minyak Wijen', category: 'Bumbu Dapur', subCategory: 'Minyak & Margarin', quantity: 0, unit: 'botol', price: 34000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Kecap & Saus (tanpa gram-graman)
  { id: 'bd-11', name: 'Kecap', category: 'Bumbu Dapur', subCategory: 'Kecap & Saus', quantity: 0, unit: 'pouch', price: 24000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-12', name: 'Kecap Asin', category: 'Bumbu Dapur', subCategory: 'Kecap & Saus', quantity: 0, unit: 'botol', price: 8000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-13', name: 'Saus Sambal', category: 'Bumbu Dapur', subCategory: 'Kecap & Saus', quantity: 0, unit: 'botol', price: 16000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-14', name: 'Saus Tomat', category: 'Bumbu Dapur', subCategory: 'Kecap & Saus', quantity: 0, unit: 'botol', price: 13000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-15', name: 'Saus Tiram', category: 'Bumbu Dapur', subCategory: 'Kecap & Saus', quantity: 0, unit: 'botol', price: 19000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-16', name: 'Saus Teriyaki', category: 'Bumbu Dapur', subCategory: 'Kecap & Saus', quantity: 0, unit: 'botol', price: 19500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Bumbu & Rempah (tanpa gram-graman)
  { id: 'bd-17', name: 'Cabai Rawit', category: 'Bumbu Dapur', subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'bungkus', price: 9000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-18', name: 'Bawang Merah', category: 'Bumbu Dapur', subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'bungkus', price: 12000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-19', name: 'Bawang Putih', category: 'Bumbu Dapur', subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'bungkus', price: 11000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-20', name: 'Bawang Bombay', category: 'Bumbu Dapur', subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'buah', price: 9000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-21', name: 'Lada Putih Bubuk', category: 'Bumbu Dapur', subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'sachet', price: 3000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-22', name: 'Ketumbar Bubuk', category: 'Bumbu Dapur', subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'sachet', price: 3000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-23', name: 'Kunyit Bubuk', category: 'Bumbu Dapur', subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'sachet', price: 3000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-24', name: 'Terasi Udang', category: 'Bumbu Dapur', subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'bungkus', price: 8000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-25', name: 'Santan Sachet', category: 'Bumbu Dapur', subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'sachet', price: 3500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-26', name: 'Cuka Dapur', category: 'Bumbu Dapur', subCategory: 'Bumbu & Rempah', quantity: 0, unit: 'botol', price: 5000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Mie & Karbohidrat (nama bersih: Mi Goreng, Mi Soto Ayam, dll.)
  { id: 'bd-27', name: 'Mi Goreng', category: 'Bumbu Dapur', subCategory: 'Mie & Karbo', quantity: 0, unit: 'bungkus', price: 3100, timesPurchased: 0, totalSpend: 0, minThreshold: 3 },
  { id: 'bd-28', name: 'Mi Soto Ayam', category: 'Bumbu Dapur', subCategory: 'Mie & Karbo', quantity: 0, unit: 'bungkus', price: 3000, timesPurchased: 0, totalSpend: 0, minThreshold: 2 },
  { id: 'bd-29', name: 'Mi Soto Kari', category: 'Bumbu Dapur', subCategory: 'Mie & Karbo', quantity: 0, unit: 'bungkus', price: 3200, timesPurchased: 0, totalSpend: 0, minThreshold: 2 },
  { id: 'bd-30', name: 'Mi Kari Ayam', category: 'Bumbu Dapur', subCategory: 'Mie & Karbo', quantity: 0, unit: 'bungkus', price: 3200, timesPurchased: 0, totalSpend: 0, minThreshold: 2 },
  { id: 'bd-31', name: 'Mi Ayam Bawang', category: 'Bumbu Dapur', subCategory: 'Mie & Karbo', quantity: 0, unit: 'bungkus', price: 3000, timesPurchased: 0, totalSpend: 0, minThreshold: 2 },
  { id: 'bd-32', name: 'Beras', category: 'Bumbu Dapur', subCategory: 'Mie & Karbo', quantity: 0, unit: 'karung', price: 75000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-33', name: 'Bihun', category: 'Bumbu Dapur', subCategory: 'Mie & Karbo', quantity: 0, unit: 'bungkus', price: 7000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-34', name: 'Soun', category: 'Bumbu Dapur', subCategory: 'Mie & Karbo', quantity: 0, unit: 'bungkus', price: 6500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Tepung
  { id: 'bd-35', name: 'Tepung Terigu', category: 'Bumbu Dapur', subCategory: 'Tepung & Pengembang', quantity: 0, unit: 'bungkus', price: 13000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-36', name: 'Tepung Tapioka', category: 'Bumbu Dapur', subCategory: 'Tepung & Pengembang', quantity: 0, unit: 'bungkus', price: 8500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-37', name: 'Tepung Maizena', category: 'Bumbu Dapur', subCategory: 'Tepung & Pengembang', quantity: 0, unit: 'bungkus', price: 6500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'bd-38', name: 'Tepung Bumbu Serbaguna', category: 'Bumbu Dapur', subCategory: 'Tepung & Pengembang', quantity: 0, unit: 'bungkus', price: 6000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // ==================== OBAT & KESEHATAN ====================
  // Obat Nyamuk
  { id: 'ok-1', name: 'Obat Nyamuk Spray', category: 'Obat & Kesehatan', subCategory: 'Obat Nyamuk', quantity: 0, unit: 'kaleng', price: 42000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-2', name: 'Obat Nyamuk Bakar', category: 'Obat & Kesehatan', subCategory: 'Obat Nyamuk', quantity: 0, unit: 'box', price: 6500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-3', name: 'Obat Nyamuk Elektrik Liquid', category: 'Obat & Kesehatan', subCategory: 'Obat Nyamuk', quantity: 0, unit: 'set', price: 29500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-4', name: 'Refill Obat Nyamuk Elektrik', category: 'Obat & Kesehatan', subCategory: 'Obat Nyamuk', quantity: 0, unit: 'botol', price: 18500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-5', name: 'Lotion Anti Nyamuk', category: 'Obat & Kesehatan', subCategory: 'Obat Nyamuk', quantity: 0, unit: 'tube', price: 9500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Obat Harian & Maag
  { id: 'ok-6', name: 'Paracetamol', category: 'Obat & Kesehatan', subCategory: 'Obat Harian & Maag', quantity: 0, unit: 'strip', price: 4500, timesPurchased: 0, totalSpend: 0, minThreshold: 2 },
  { id: 'ok-7', name: 'Bodrex', category: 'Obat & Kesehatan', subCategory: 'Obat Harian & Maag', quantity: 0, unit: 'strip', price: 3500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-8', name: 'Mylanta', category: 'Obat & Kesehatan', subCategory: 'Obat Harian & Maag', quantity: 0, unit: 'strip', price: 9000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-9', name: 'Promag', category: 'Obat & Kesehatan', subCategory: 'Obat Harian & Maag', quantity: 0, unit: 'strip', price: 8500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-10', name: 'Tolak Angin', category: 'Obat & Kesehatan', subCategory: 'Obat Harian & Maag', quantity: 0, unit: 'box', price: 44000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-11', name: 'Obat Batuk', category: 'Obat & Kesehatan', subCategory: 'Obat Harian & Maag', quantity: 0, unit: 'botol', price: 21000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-12', name: 'Obat Flu', category: 'Obat & Kesehatan', subCategory: 'Obat Harian & Maag', quantity: 0, unit: 'strip', price: 4000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-13', name: 'Obat Diare', category: 'Obat & Kesehatan', subCategory: 'Obat Harian & Maag', quantity: 0, unit: 'strip', price: 7000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // P3K & Luka
  { id: 'ok-14', name: 'Betadine Antiseptik', category: 'Obat & Kesehatan', subCategory: 'P3K & Luka', quantity: 0, unit: 'botol', price: 24500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-15', name: 'Plester Luka', category: 'Obat & Kesehatan', subCategory: 'P3K & Luka', quantity: 0, unit: 'amplop', price: 7500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-16', name: 'Alkohol 70%', category: 'Obat & Kesehatan', subCategory: 'P3K & Luka', quantity: 0, unit: 'botol', price: 8500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-17', name: 'Rivanol', category: 'Obat & Kesehatan', subCategory: 'P3K & Luka', quantity: 0, unit: 'botol', price: 7500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-18', name: 'Kasa Steril', category: 'Obat & Kesehatan', subCategory: 'P3K & Luka', quantity: 0, unit: 'box', price: 11000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-19', name: 'Kapas Medis', category: 'Obat & Kesehatan', subCategory: 'P3K & Luka', quantity: 0, unit: 'bungkus', price: 6000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Minyak & Salep
  { id: 'ok-20', name: 'Minyak Kayu Putih', category: 'Obat & Kesehatan', subCategory: 'Minyak & Salep', quantity: 0, unit: 'botol', price: 46000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-21', name: 'Freshcare Aromatherapy', category: 'Obat & Kesehatan', subCategory: 'Minyak & Salep', quantity: 0, unit: 'botol', price: 16000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-22', name: 'Counterpain', category: 'Obat & Kesehatan', subCategory: 'Minyak & Salep', quantity: 0, unit: 'tube', price: 34000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-23', name: 'Koyo Salonpas', category: 'Obat & Kesehatan', subCategory: 'Minyak & Salep', quantity: 0, unit: 'bungkus', price: 8500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-24', name: 'Hot In Cream', category: 'Obat & Kesehatan', subCategory: 'Minyak & Salep', quantity: 0, unit: 'tube', price: 21000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-25', name: 'Inhaler Vicks', category: 'Obat & Kesehatan', subCategory: 'Minyak & Salep', quantity: 0, unit: 'buah', price: 18000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Vitamin & Alat Medis
  { id: 'ok-26', name: 'Vitamin C', category: 'Obat & Kesehatan', subCategory: 'Vitamin & Alat Medis', quantity: 0, unit: 'botol', price: 8000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-27', name: 'CDR Effervescent', category: 'Obat & Kesehatan', subCategory: 'Vitamin & Alat Medis', quantity: 0, unit: 'tube', price: 52000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-28', name: 'Termometer Digital', category: 'Obat & Kesehatan', subCategory: 'Vitamin & Alat Medis', quantity: 0, unit: 'unit', price: 65000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-29', name: 'Masker Medis', category: 'Obat & Kesehatan', subCategory: 'Vitamin & Alat Medis', quantity: 0, unit: 'box', price: 22000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ok-30', name: 'Hand Sanitizer', category: 'Obat & Kesehatan', subCategory: 'Vitamin & Alat Medis', quantity: 0, unit: 'botol', price: 9000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // ==================== KEBERSIHAN TOILET ====================
  // Sabun & Perawatan Mandi
  { id: 'kt-1', name: 'Sabun Mandi Batang', category: 'Kebersihan Toilet', subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'buah', price: 5000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-2', name: 'Sabun Mandi Cair', category: 'Kebersihan Toilet', subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'pouch', price: 26000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-3', name: 'Shampoo', category: 'Kebersihan Toilet', subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'botol', price: 34000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-4', name: 'Pasta Gigi', category: 'Kebersihan Toilet', subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'tube', price: 16500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-5', name: 'Sikat Gigi', category: 'Kebersihan Toilet', subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'buah', price: 6000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-6', name: 'Pembersih Muka', category: 'Kebersihan Toilet', subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'tube', price: 45000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-7', name: 'Deodorant', category: 'Kebersihan Toilet', subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'botol', price: 21000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-8', name: 'Pisau Cukur', category: 'Kebersihan Toilet', subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'buah', price: 15000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-9', name: 'Hand Soap', category: 'Kebersihan Toilet', subCategory: 'Sabun Mandi & Perawatan', quantity: 0, unit: 'botol', price: 21000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Cuci Piring & Dapur
  { id: 'kt-10', name: 'Sabun Cuci Piring', category: 'Kebersihan Toilet', subCategory: 'Cuci Piring & Dapur', quantity: 0, unit: 'pouch', price: 14000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-11', name: 'Spons Cuci Piring', category: 'Kebersihan Toilet', subCategory: 'Cuci Piring & Dapur', quantity: 0, unit: 'buah', price: 5000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-12', name: 'Kawat Cuci Piring', category: 'Kebersihan Toilet', subCategory: 'Cuci Piring & Dapur', quantity: 0, unit: 'buah', price: 4000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Cuci Pakaian
  { id: 'kt-13', name: 'Deterjen Bubuk', category: 'Kebersihan Toilet', subCategory: 'Cuci Pakaian', quantity: 0, unit: 'bungkus', price: 24000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-14', name: 'Deterjen Cair', category: 'Kebersihan Toilet', subCategory: 'Cuci Pakaian', quantity: 0, unit: 'pouch', price: 26000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-15', name: 'Pewangi Pakaian', category: 'Kebersihan Toilet', subCategory: 'Cuci Pakaian', quantity: 0, unit: 'pouch', price: 29000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-16', name: 'Pelicin Pakaian', category: 'Kebersihan Toilet', subCategory: 'Cuci Pakaian', quantity: 0, unit: 'pouch', price: 7000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Pembersih Lantai & Toilet
  { id: 'kt-17', name: 'Pembersih Lantai', category: 'Kebersihan Toilet', subCategory: 'Pembersih Lantai & Toilet', quantity: 0, unit: 'pouch', price: 18000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-18', name: 'Pembersih Kloset', category: 'Kebersihan Toilet', subCategory: 'Pembersih Lantai & Toilet', quantity: 0, unit: 'botol', price: 23500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-19', name: 'Pembersih Kaca', category: 'Kebersihan Toilet', subCategory: 'Pembersih Lantai & Toilet', quantity: 0, unit: 'botol', price: 9500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-20', name: 'Kapur Barus Toilet', category: 'Kebersihan Toilet', subCategory: 'Pembersih Lantai & Toilet', quantity: 0, unit: 'bungkus', price: 13000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-21', name: 'Pewangi Ruangan', category: 'Kebersihan Toilet', subCategory: 'Pembersih Lantai & Toilet', quantity: 0, unit: 'buah', price: 14500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Tisu & Alat Kebersihan
  { id: 'kt-22', name: 'Tisu Wajah', category: 'Kebersihan Toilet', subCategory: 'Tisu & Alat Kebersihan', quantity: 0, unit: 'bungkus', price: 14500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-23', name: 'Tisu Toilet', category: 'Kebersihan Toilet', subCategory: 'Tisu & Alat Kebersihan', quantity: 0, unit: 'roll', price: 5000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-24', name: 'Tisu Basah', category: 'Kebersihan Toilet', subCategory: 'Tisu & Alat Kebersihan', quantity: 0, unit: 'bungkus', price: 12000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-25', name: 'Kantong Plastik Sampah', category: 'Kebersihan Toilet', subCategory: 'Tisu & Alat Kebersihan', quantity: 0, unit: 'bungkus', price: 15000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-26', name: 'Sapu Ijuk', category: 'Kebersihan Toilet', subCategory: 'Tisu & Alat Kebersihan', quantity: 0, unit: 'buah', price: 28000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-27', name: 'Pengki Sampah', category: 'Kebersihan Toilet', subCategory: 'Tisu & Alat Kebersihan', quantity: 0, unit: 'buah', price: 17000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-28', name: 'Kain Pel Mop', category: 'Kebersihan Toilet', subCategory: 'Tisu & Alat Kebersihan', quantity: 0, unit: 'buah', price: 32000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-29', name: 'Ember Plastik', category: 'Kebersihan Toilet', subCategory: 'Tisu & Alat Kebersihan', quantity: 0, unit: 'buah', price: 25000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'kt-30', name: 'Gayung Air', category: 'Kebersihan Toilet', subCategory: 'Tisu & Alat Kebersihan', quantity: 0, unit: 'buah', price: 8000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // ==================== MINUMAN & GALON ====================
  // Air Minum (Air Galon tanpa deskripsi Aqua 19L)
  { id: 'mg-1', name: 'Air Galon', category: 'Minuman & Galon', subCategory: 'Air Minum', quantity: 0, unit: 'galon', price: 20000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-2', name: 'Air Mineral Botol', category: 'Minuman & Galon', subCategory: 'Air Minum', quantity: 0, unit: 'botol', price: 4000, timesPurchased: 0, totalSpend: 0, minThreshold: 2 },
  
  // Kopi & Teh
  { id: 'mg-3', name: 'Kopi Hitam', category: 'Minuman & Galon', subCategory: 'Kopi & Teh', quantity: 0, unit: 'bungkus', price: 28000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-4', name: 'Kopi Sachet', category: 'Minuman & Galon', subCategory: 'Kopi & Teh', quantity: 0, unit: 'renteng', price: 16000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-5', name: 'Kopi Instan Jar', category: 'Minuman & Galon', subCategory: 'Kopi & Teh', quantity: 0, unit: 'jar', price: 38500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-6', name: 'Teh Celup', category: 'Minuman & Galon', subCategory: 'Kopi & Teh', quantity: 0, unit: 'box', price: 9500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-7', name: 'Teh Botol Kemasan', category: 'Minuman & Galon', subCategory: 'Kopi & Teh', quantity: 0, unit: 'botol', price: 4000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Susu
  { id: 'mg-8', name: 'Susu UHT', category: 'Minuman & Galon', subCategory: 'Susu', quantity: 0, unit: 'kotak', price: 19500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-9', name: 'Susu Beruang Steril', category: 'Minuman & Galon', subCategory: 'Susu', quantity: 0, unit: 'kaleng', price: 10500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-10', name: 'Susu Kental Manis', category: 'Minuman & Galon', subCategory: 'Susu', quantity: 0, unit: 'pouch', price: 19500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Minuman Segar & Isotonik (Pocari Sweat udah gitu saja)
  { id: 'mg-11', name: 'Pocari Sweat', category: 'Minuman & Galon', subCategory: 'Minuman Segar & Isotonik', quantity: 0, unit: 'botol', price: 8500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-12', name: 'Air Kelapa Kemasan', category: 'Minuman & Galon', subCategory: 'Minuman Segar & Isotonik', quantity: 0, unit: 'kotak', price: 8000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-13', name: 'Minuman Cokelat', category: 'Minuman & Galon', subCategory: 'Minuman Segar & Isotonik', quantity: 0, unit: 'renteng', price: 18500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-14', name: 'Nutrisari', category: 'Minuman & Galon', subCategory: 'Minuman Segar & Isotonik', quantity: 0, unit: 'renteng', price: 14500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'mg-15', name: 'Minuman Soda', category: 'Minuman & Galon', subCategory: 'Minuman Segar & Isotonik', quantity: 0, unit: 'kaleng', price: 7500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // ==================== CEMILAN & MAKANAN ====================
  // Es Krim (Kategori Cemilan sub-kategori Es Krim sesuai request)
  { id: 'cm-1', name: 'Es Krim', category: 'Cemilan & Makanan', subCategory: 'Es Krim', quantity: 0, unit: 'buah', price: 12000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-2', name: 'Es Krim Cone', category: 'Cemilan & Makanan', subCategory: 'Es Krim', quantity: 0, unit: 'buah', price: 15000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-3', name: 'Es Krim Cup', category: 'Cemilan & Makanan', subCategory: 'Es Krim', quantity: 0, unit: 'cup', price: 10000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Biskuit & Wafer
  { id: 'cm-4', name: 'Oreo', category: 'Cemilan & Makanan', subCategory: 'Biskuit & Wafer', quantity: 0, unit: 'bungkus', price: 9500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-5', name: 'Wafer Cokelat', category: 'Cemilan & Makanan', subCategory: 'Biskuit & Wafer', quantity: 0, unit: 'bungkus', price: 8500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-6', name: 'Biskuit Gandum', category: 'Cemilan & Makanan', subCategory: 'Biskuit & Wafer', quantity: 0, unit: 'bungkus', price: 11000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Keripik & Snack
  { id: 'cm-7', name: 'Keripik Kentang', category: 'Cemilan & Makanan', subCategory: 'Keripik & Snack', quantity: 0, unit: 'bungkus', price: 11500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-8', name: 'Keripik Singkong', category: 'Cemilan & Makanan', subCategory: 'Keripik & Snack', quantity: 0, unit: 'bungkus', price: 10000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-9', name: 'Kacang Kulit', category: 'Cemilan & Makanan', subCategory: 'Keripik & Snack', quantity: 0, unit: 'bungkus', price: 14000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-10', name: 'Cokelat Batang', category: 'Cemilan & Makanan', subCategory: 'Keripik & Snack', quantity: 0, unit: 'buah', price: 23000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Frozen Food & Siap Saji
  { id: 'cm-11', name: 'Nugget Ayam', category: 'Cemilan & Makanan', subCategory: 'Frozen Food & Siap Saji', quantity: 0, unit: 'bungkus', price: 48000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-12', name: 'Sosis Siap Makan', category: 'Cemilan & Makanan', subCategory: 'Frozen Food & Siap Saji', quantity: 0, unit: 'bungkus', price: 10000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-13', name: 'Bakso Sapi', category: 'Cemilan & Makanan', subCategory: 'Frozen Food & Siap Saji', quantity: 0, unit: 'bungkus', price: 46000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-14', name: 'Kentang Goreng Beku', category: 'Cemilan & Makanan', subCategory: 'Frozen Food & Siap Saji', quantity: 0, unit: 'bungkus', price: 36000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-15', name: 'Dimsum Ayam', category: 'Cemilan & Makanan', subCategory: 'Frozen Food & Siap Saji', quantity: 0, unit: 'bungkus', price: 38000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Roti & Selai
  { id: 'cm-16', name: 'Roti Tawar', category: 'Cemilan & Makanan', subCategory: 'Roti & Selai', quantity: 0, unit: 'bungkus', price: 17500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-17', name: 'Selai Cokelat', category: 'Cemilan & Makanan', subCategory: 'Roti & Selai', quantity: 0, unit: 'jar', price: 42000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-18', name: 'Selai Kacang', category: 'Cemilan & Makanan', subCategory: 'Roti & Selai', quantity: 0, unit: 'jar', price: 31000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'cm-19', name: 'Keju Slice', category: 'Cemilan & Makanan', subCategory: 'Roti & Selai', quantity: 0, unit: 'bungkus', price: 16500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // ==================== ALAT TULIS & KOS ====================
  // Alat Tulis
  { id: 'ap-1', name: 'Buku Tulis', category: 'Alat Tulis & Kos', subCategory: 'Alat Tulis', quantity: 0, unit: 'buah', price: 5000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-2', name: 'Pulpen Hitam', category: 'Alat Tulis & Kos', subCategory: 'Alat Tulis', quantity: 0, unit: 'buah', price: 3500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-3', name: 'Pensil 2B', category: 'Alat Tulis & Kos', subCategory: 'Alat Tulis', quantity: 0, unit: 'buah', price: 4000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-4', name: 'Penghapus', category: 'Alat Tulis & Kos', subCategory: 'Alat Tulis', quantity: 0, unit: 'buah', price: 3500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-5', name: 'Tipe-X Kertas', category: 'Alat Tulis & Kos', subCategory: 'Alat Tulis', quantity: 0, unit: 'buah', price: 11500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-6', name: 'Kertas HVS A4', category: 'Alat Tulis & Kos', subCategory: 'Alat Tulis', quantity: 0, unit: 'rim', price: 48000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-7', name: 'Gunting', category: 'Alat Tulis & Kos', subCategory: 'Alat Tulis', quantity: 0, unit: 'buah', price: 12500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-8', name: 'Cutter', category: 'Alat Tulis & Kos', subCategory: 'Alat Tulis', quantity: 0, unit: 'buah', price: 9000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-9', name: 'Lakban Bening', category: 'Alat Tulis & Kos', subCategory: 'Alat Tulis', quantity: 0, unit: 'roll', price: 14000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-10', name: 'Sticky Notes', category: 'Alat Tulis & Kos', subCategory: 'Alat Tulis', quantity: 0, unit: 'pad', price: 13500, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Kelistrikan & Kamar
  { id: 'ap-11', name: 'Stopkontak Kabel', category: 'Alat Tulis & Kos', subCategory: 'Kelistrikan & Kamar', quantity: 0, unit: 'unit', price: 54000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-12', name: 'Bohlam Lampu LED', category: 'Alat Tulis & Kos', subCategory: 'Kelistrikan & Kamar', quantity: 0, unit: 'buah', price: 42000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-13', name: 'Baterai AA', category: 'Alat Tulis & Kos', subCategory: 'Kelistrikan & Kamar', quantity: 0, unit: 'bungkus', price: 14000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-14', name: 'Baterai AAA', category: 'Alat Tulis & Kos', subCategory: 'Kelistrikan & Kamar', quantity: 0, unit: 'bungkus', price: 14000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-15', name: 'Lilin Darurat', category: 'Alat Tulis & Kos', subCategory: 'Kelistrikan & Kamar', quantity: 0, unit: 'bungkus', price: 12000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-16', name: 'Korek Api Gas', category: 'Alat Tulis & Kos', subCategory: 'Kelistrikan & Kamar', quantity: 0, unit: 'buah', price: 4000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },

  // Perlengkapan Jemuran & Kos
  { id: 'ap-17', name: 'Gantungan Baju (Hanger)', category: 'Alat Tulis & Kos', subCategory: 'Perlengkapan Jemuran & Kos', quantity: 0, unit: 'bungkus', price: 18000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-18', name: 'Jepitan Pakaian', category: 'Alat Tulis & Kos', subCategory: 'Perlengkapan Jemuran & Kos', quantity: 0, unit: 'bungkus', price: 15000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 },
  { id: 'ap-19', name: 'Kabel Ties', category: 'Alat Tulis & Kos', subCategory: 'Perlengkapan Jemuran & Kos', quantity: 0, unit: 'bungkus', price: 16000, timesPurchased: 0, totalSpend: 0, minThreshold: 1 }
];

export const DEVELOPER_SUGGESTIONS: DeveloperSuggestion[] = [
  {
    id: 'sug-v2-1',
    title: 'Zero-State Reset & Pembersihan Kuantitas Katalog',
    type: 'optimization',
    description: 'Seluruh kuantitas item katalog KosMan di-reset ke 0 (katalog master tetap utuh dengan kategori, sub-kategori, dan estimasi harga), serta seluruh catatan transaksi dan rutinitas dikosongkan agar Anda dapat memulai pencatatan dari nol secara bersih.',
    impact: 'High',
    suggestedAction: 'Katalog kosong siap digunakan. Tambah stok riil Anda lewat tombol + atau melalui pencatatan transaksi belanja di Keuangan.',
    applied: true,
  },
  {
    id: 'sug-v2-2',
    title: 'Integrasi Otomatis Keuangan -> Stok Kosman & Baris Google Sheets',
    type: 'feature',
    description: 'Setiap kali mencatat transaksi pengeluaran belanja bahan pokok di Keuangan, stok barang di KosMan otomatis bertambah dan total spend terakumulasi secara instan tanpa perlu entri manual ganda. Data juga langsung siap disinkronkan ke Google Sheets.',
    impact: 'High',
    suggestedAction: 'Coba catat belanja di menu Keuangan (contoh: "Air Galon" atau "Mi Goreng") dan cek otomatisasi stoknya di KosMan.',
    applied: true,
  },
  {
    id: 'sug-v2-3',
    title: 'Modul Native Waktu Ibadah & Tautan Resmi waktuibadah.vercel.app',
    type: 'feature',
    description: 'Modul baru terintegrasi langsung untuk menghitung jadwal sholat 5 waktu, Imsak, dan Dhuha untuk kota-kota di Indonesia, hitung mundur adzan berikutnya, panduan arah kiblat, checklist sholat harian, audio adzan/chime, serta kartu web icon resmi waktuibadah.vercel.app.',
    impact: 'High',
    suggestedAction: 'Buka menu Waktu Ibadah untuk melihat jadwal harian dan akses cepat ke situs waktuibadah.vercel.app.',
    applied: true,
  },
  {
    id: 'sug-v2-4',
    title: 'Pemisahan Modul Kegiatan & Live Trip Tracker',
    type: 'feature',
    description: 'Perjalanan (Trips & Live Tracking) kini dipisah dari catatan dan digabungkan ke modul Kegiatan. Dilengkapi live timer, penanda rute, dan form Selesai Perjalanan yang otomatis memasukkan pengeluaran BBM & Tol ke modul Keuangan.',
    impact: 'High',
    suggestedAction: 'Gunakan tombol Mulai Perjalanan saat bepergian untuk memantau durasi dan biaya kendaraan secara real-time.',
    applied: true,
  },
  {
    id: 'sug-v2-5',
    title: 'Bugfix: Sinkronisasi Hydration LocalStorage & Konsistensi Tanggal ISO',
    type: 'bugfix',
    description: 'Memperbaiki bug formatting tanggal di beberapa browser lokal yang menyebabkan selisih zona waktu (UTC vs WIB) pada pencatatan transaksi dan log harian. Menggunakan format standar YYYY-MM-DD lokal.',
    impact: 'Medium',
    suggestedAction: 'Sudah diterapkan otomatis pada engine penyimpanan lokal v2.0.0.',
    applied: true,
  },
  {
    id: 'sug-v2-6',
    title: 'Saran Upgrade: Web Audio Chime untuk Pengingat Adzan & Haptic Feedback',
    type: 'feature',
    description: 'Dukungan audio synthesizer Web Audio API bebas dependensi eksternal untuk bunyi notifikasi adzan dan efek klik komik pop yang responsif di perangkat mobile.',
    impact: 'Medium',
    suggestedAction: 'Aktifkan suara di modul Waktu Ibadah untuk mendengarkan nada pengingat waktu sholat.',
    applied: true,
  }
];

