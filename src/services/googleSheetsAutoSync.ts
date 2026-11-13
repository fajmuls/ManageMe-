import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { TARGET_SPREADSHEET_ID } from '../data/initialAppData';
import { normalizeKosCategory } from '../data/kosmanItems';
import { KosItem, WishlistItem, FinanceRecord, BudgetPos, KosCategory } from '../types/kosman';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((s) => provider.addScope(s));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const getSpreadsheetId = (): string => {
  return localStorage.getItem('manageme_target_spreadsheet_id') || TARGET_SPREADSHEET_ID;
};

export const setSpreadsheetId = (id: string) => {
  const clean = extractSpreadsheetId(id);
  localStorage.setItem('manageme_target_spreadsheet_id', clean);
  return clean;
};

export const extractSpreadsheetId = (urlOrId: string): string => {
  const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : urlOrId.trim();
};

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string; spreadsheetId: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses Google Sign-In');
    }

    cachedAccessToken = credential.accessToken;
    const spreadsheetId = getSpreadsheetId();
    return { user: result.user, accessToken: cachedAccessToken, spreadsheetId };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => cachedAccessToken;

export const getCurrentUser = (): User | null => auth.currentUser;

export const googleSignOut = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Fetch spreadsheet metadata (tabs & sheetIds)
export const fetchSpreadsheetMetadata = async (token: string, spreadsheetId: string) => {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}: Tidak dapat mengakses Spreadsheet`);
  }
  return await res.json();
};

// Setup 5-tab relational schema with live formulas, freeze headers & filters
export const setupSpreadsheetDatabase = async (
  token: string,
  spreadsheetId: string,
  payload: {
    items: KosItem[];
    wishlist: WishlistItem[];
    financeRecords: FinanceRecord[];
    budgetPos: BudgetPos[];
  }
) => {
  const meta = await fetchSpreadsheetMetadata(token, spreadsheetId);
  const existingSheets: { title: string; sheetId: number }[] = (meta.sheets || []).map((s: any) => ({
    title: s.properties.title,
    sheetId: s.properties.sheetId,
  }));

  const requiredTabs = [
    'Dashboard_Ringkasan',
    'KosMan_Inventaris',
    'Wishlist_Belanja',
    'Keuangan_Transaksi',
    'Kos_Budget_Simulasi',
  ];

  const addRequests = requiredTabs
    .filter((tab) => !existingSheets.some((s) => s.title === tab))
    .map((tab) => ({
      addSheet: { properties: { title: tab, gridProperties: { frozenRowCount: 1 } } },
    }));

  if (addRequests.length > 0) {
    const addRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: addRequests }),
    });
    if (!addRes.ok) {
      const err = await addRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Gagal membuat tab database baru di Spreadsheet');
    }
  }

  // Re-fetch updated sheetIds for filter & freeze formatting
  const updatedMeta = await fetchSpreadsheetMetadata(token, spreadsheetId);
  const tabMap: Record<string, number> = {};
  (updatedMeta.sheets || []).forEach((s: any) => {
    tabMap[s.properties.title] = s.properties.sheetId;
  });

  // 1. Write Dashboard_Ringkasan with live formulas
  const dashboardRows = [
    ['MANAGEME! DATABASE DASHBOARD', 'NILAI LIVE', 'RUMUS / KETERANGAN'],
    ['Terakhir Disinkronkan', new Date().toLocaleString('id-ID'), 'Timestamp sinkronisasi aplikasi'],
    ['Total Pemasukan (IDR)', '=SUMIF(Keuangan_Transaksi!D2:D,"Pemasukan",Keuangan_Transaksi!H2:H)', 'SUMIF seluruh pemasukan'],
    ['Total Pengeluaran (IDR)', '=SUMIF(Keuangan_Transaksi!D2:D,"Pengeluaran",Keuangan_Transaksi!H2:H)', 'SUMIF seluruh pengeluaran'],
    ['Saldo Kas Bersih (IDR)', '=B3-B4', 'Total Pemasukan - Total Pengeluaran'],
    ['Pemasukan Minggu Ini (IDR)', '=SUMIFS(Keuangan_Transaksi!H2:H,Keuangan_Transaksi!D2:D,"Pemasukan",Keuangan_Transaksi!C2:C,ISOWEEKNUM(TODAY()))', 'Pemasukan ISOWEEKNUM minggu berjalan'],
    ['Pengeluaran Minggu Ini (IDR)', '=SUMIFS(Keuangan_Transaksi!H2:H,Keuangan_Transaksi!D2:D,"Pengeluaran",Keuangan_Transaksi!C2:C,ISOWEEKNUM(TODAY()))', 'Pengeluaran ISOWEEKNUM minggu berjalan'],
    ['Total Nilai Stok KosMan (IDR)', '=SUM(KosMan_Inventaris!J2:J)', 'Akumulasi stok * harga satuan'],
    ['Jumlah Barang KosMan HABIS', '=COUNTIF(KosMan_Inventaris!K2:K,"HABIS")', 'Item stok = 0'],
    ['Jumlah Barang KosMan LOW', '=COUNTIF(KosMan_Inventaris!K2:K,"LOW")', 'Item stok <= minimum'],
    ['Estimasi Biaya Wishlist Aktif', '=SUMIF(Wishlist_Belanja!H2:H,FALSE,Wishlist_Belanja!G2:G)', 'Total barang wishlist belum dibeli'],
    ['Total Target Budget Mingguan', '=SUM(Kos_Budget_Simulasi!C2:C)', 'Total alokasi pos mingguan kos'],
  ];

  // 2. KosMan_Inventaris rows (with formulas Col J & Col K)
  const kosHeader = [
    'ID', 'Nama_Item', 'Kategori_Utama', 'Multi_Tags', 'Sub_Kategori',
    'Stok', 'Satuan', 'Min_Stok', 'Harga_Satuan', 'Total_Nilai',
    'Status_Stok', 'Catatan', 'Terakhir_Diubah'
  ];
  const kosRows = payload.items.map((item, idx) => {
    const r = idx + 2;
    const tagsStr = (item.tags && item.tags.length > 0 ? item.tags : [item.category]).join(', ');
    return [
      item.id,
      item.name,
      item.category,
      tagsStr,
      item.subCategory,
      item.quantity,
      item.unit,
      item.minThreshold,
      item.price,
      `=F${r}*I${r}`,
      `=IF(F${r}=0,"HABIS",IF(F${r}<=H${r},"LOW","AMAN"))`,
      item.notes || '',
      item.lastPurchasedDate || new Date().toISOString().split('T')[0],
    ];
  });

  // 3. Wishlist_Belanja rows (Col G Subtotal formula)
  const wishHeader = [
    'ID', 'Nama_Barang', 'Kategori_Belanja', 'Sub_Kategori', 'Qty_Beli',
    'Estimasi_Harga', 'Subtotal', 'Sudah_Dibeli', 'Prioritas', 'Sumber'
  ];
  const wishRows = payload.wishlist.map((w, idx) => {
    const r = idx + 2;
    return [
      w.id,
      w.name,
      w.shoppingCategory,
      w.subCategory || 'Umum',
      w.quantity,
      w.estimatedPrice,
      `=E${r}*F${r}`,
      w.purchased,
      w.priority,
      w.source,
    ];
  });

  // 4. Keuangan_Transaksi rows (Col C ISOWEEKNUM formula)
  const finHeader = [
    'ID', 'Tanggal', 'Minggu_Ke', 'Tipe', 'Kategori',
    'Sub_Kategori', 'Keterangan', 'Nominal', 'Akun', 'Sumber'
  ];
  const finRows = payload.financeRecords.map((f, idx) => {
    const r = idx + 2;
    return [
      f.id,
      f.date,
      `=IF(B${r}="","",IFERROR(ISOWEEKNUM(DATEVALUE(B${r})),ISOWEEKNUM(TODAY())))`,
      f.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      f.category,
      f.subCategory || '',
      f.note,
      f.amount,
      f.account,
      f.source || 'app',
    ];
  });

  // 5. Kos_Budget_Simulasi rows (live REGEXMATCH + FILTER formula)
  const budgetHeader = [
    'ID', 'Pos_Anggaran', 'Budget_Mingguan', 'Alokasi_Persen',
    'Terpakai_Minggu_Ini', 'Sisa_Budget', 'Kategori_Terkait_Regex', 'Status'
  ];
  const budgetRows = payload.budgetPos.map((p, idx) => {
    const r = idx + 2;
    const regexStr = p.linkedCategories.join('|');
    return [
      p.id,
      p.name,
      p.weeklyTarget,
      p.allocationPercent,
      `=IFERROR(SUM(FILTER(Keuangan_Transaksi!$H$2:$H,Keuangan_Transaksi!$D$2:$D="Pengeluaran",Keuangan_Transaksi!$C$2:$C=ISOWEEKNUM(TODAY()),REGEXMATCH(Keuangan_Transaksi!$E$2:$E,G${r}))),0)`,
      `=C${r}-E${r}`,
      regexStr,
      `=IF(F${r}<0,"OVER","AMAN")`,
    ];
  });

  // Clear existing ranges cleanly before batch writing
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ranges: [
        'Dashboard_Ringkasan!A1:C50',
        'KosMan_Inventaris!A1:M1000',
        'Wishlist_Belanja!A1:J1000',
        'Keuangan_Transaksi!A1:J1000',
        'Kos_Budget_Simulasi!A1:H100',
      ],
    }),
  });

  const batchUpdateValuesRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: 'Dashboard_Ringkasan!A1', values: dashboardRows },
          { range: 'KosMan_Inventaris!A1', values: [kosHeader, ...kosRows] },
          { range: 'Wishlist_Belanja!A1', values: [wishHeader, ...wishRows] },
          { range: 'Keuangan_Transaksi!A1', values: [finHeader, ...finRows] },
          { range: 'Kos_Budget_Simulasi!A1', values: [budgetHeader, ...budgetRows] },
        ],
      }),
    }
  );

  if (!batchUpdateValuesRes.ok) {
    const err = await batchUpdateValuesRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal menulis data & rumus ke Spreadsheet');
  }

  // Enable BasicFilter + Freeze Header Row on data tabs
  const formatRequests: any[] = [];
  const filterSpecs: [string, number][] = [
    ['KosMan_Inventaris', 13],
    ['Wishlist_Belanja', 10],
    ['Keuangan_Transaksi', 10],
    ['Kos_Budget_Simulasi', 8],
  ];

  filterSpecs.forEach(([title, colCount]) => {
    const sid = tabMap[title];
    if (sid !== undefined) {
      formatRequests.push({
        updateSheetProperties: {
          properties: { sheetId: sid, gridProperties: { frozenRowCount: 1 } },
          fields: 'gridProperties.frozenRowCount',
        },
      });
      formatRequests.push({
        setBasicFilter: {
          filter: {
            range: { sheetId: sid, startRowIndex: 0, startColumnIndex: 0, endColumnIndex: colCount },
          },
        },
      });
    }
  });

  if (formatRequests.length > 0) {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: formatRequests }),
    }).catch(() => {});
  }

  return true;
};

// Pull (Read) 2-way sync from Google Spreadsheet (reads edits made by ChatGPT or manually!)
export const pullDatabaseFromSheets = async (token: string, spreadsheetId: string) => {
  const ranges = [
    'KosMan_Inventaris!A2:M1000',
    'Wishlist_Belanja!A2:J1000',
    'Keuangan_Transaksi!A2:J1000',
    'Kos_Budget_Simulasi!A2:H100',
  ];

  const query = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join('&');
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${query}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal membaca data dari Google Spreadsheet');
  }

  const data = await res.json();
  const valueRanges = data.valueRanges || [];

  const parseNum = (val: any): number => {
    if (typeof val === 'number') return val;
    const cleaned = String(val || '0').replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // 1. Parse KosMan_Inventaris
  const rawKos: any[][] = valueRanges[0]?.values || [];
  const items: KosItem[] = rawKos
    .filter((row) => row[1])
    .map((row, i) => {
      const cat = normalizeKosCategory(row[2]);
      const tagsRaw = String(row[3] || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map(normalizeKosCategory);
      const tags: KosCategory[] = tagsRaw.length > 0 ? Array.from(new Set(tagsRaw)) : [cat];

      return {
        id: String(row[0] || `sheet-item-${Date.now()}-${i}`),
        name: String(row[1]).trim(),
        category: cat,
        tags,
        subCategory: String(row[4] || 'Umum').trim(),
        quantity: parseNum(row[5]),
        unit: String(row[6] || 'buah').trim(),
        minThreshold: parseNum(row[7]) || 1,
        price: parseNum(row[8]),
        timesPurchased: 0,
        totalSpend: 0,
        notes: String(row[11] || ''),
        lastPurchasedDate: String(row[12] || new Date().toISOString().split('T')[0]),
      };
    });

  // 2. Parse Wishlist_Belanja
  const rawWish: any[][] = valueRanges[1]?.values || [];
  const wishlist: WishlistItem[] = rawWish
    .filter((row) => row[1])
    .map((row, i) => ({
      id: String(row[0] || `sheet-wish-${Date.now()}-${i}`),
      name: String(row[1]).trim(),
      shoppingCategory: normalizeKosCategory(row[2]),
      subCategory: String(row[3] || 'Umum').trim(),
      quantity: Math.max(1, parseNum(row[4])),
      unit: 'pcs',
      estimatedPrice: parseNum(row[5]),
      purchased: String(row[7] || '').toUpperCase() === 'TRUE',
      priority: (['Wajib', 'Sedang', 'Keinginan'].includes(String(row[8])) ? String(row[8]) : 'Sedang') as any,
      source: (String(row[9] || 'sheets') as any),
      createdAt: Date.now() - i,
    }));

  // 3. Parse Keuangan_Transaksi
  const rawFin: any[][] = valueRanges[2]?.values || [];
  const financeRecords: FinanceRecord[] = rawFin
    .filter((row) => row[6] || row[7])
    .map((row, i) => {
      const tipeRaw = String(row[3] || '').toLowerCase();
      const type = tipeRaw.includes('masuk') || tipeRaw === 'income' ? 'income' : 'expense';
      const accRaw = String(row[8] || 'Kas');
      const account = (['Kas', 'Bank', 'E-Wallet'].includes(accRaw) ? accRaw : 'Kas') as any;

      return {
        id: String(row[0] || `sheet-fin-${Date.now()}-${i}`),
        date: String(row[1] || new Date().toISOString().split('T')[0]),
        type,
        category: String(row[4] || 'Lainnya').trim(),
        subCategory: String(row[5] || '').trim(),
        note: String(row[6] || 'Transaksi Sheets').trim(),
        amount: parseNum(row[7]),
        account,
        source: (String(row[9] || 'sheets') as any),
        createdAt: Date.now() - i * 1000,
      };
    });

  // 4. Parse Kos_Budget_Simulasi
  const rawBudget: any[][] = valueRanges[3]?.values || [];
  const palette = ['#00E5FF', '#FFD000', '#FF4B82', '#A3E635', '#A855F7'];
  const budgetPos: BudgetPos[] = rawBudget
    .filter((row) => row[1])
    .map((row, i) => ({
      id: String(row[0] || `pos-${i}`),
      name: String(row[1]).trim(),
      weeklyTarget: parseNum(row[2]),
      allocationPercent: parseNum(row[3]),
      linkedCategories: String(row[6] || row[1])
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean),
      color: palette[i % palette.length],
    }));

  return { items, wishlist, financeRecords, budgetPos };
};

// Append Row Helper
export const appendSheetRow = async (
  token: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });
  return await res.json();
};

// Auto-sync a new Finance Record to Keuangan_Transaksi
export const autoSyncFinanceToSheets = async (record: {
  id: string;
  date: string;
  type: string;
  category: string;
  subCategory?: string;
  amount: number;
  note: string;
  account: string;
  source?: string;
}) => {
  const token = getAccessToken();
  const sheetId = getSpreadsheetId();
  if (!token || !sheetId) return;

  try {
    await appendSheetRow(token, sheetId, 'Keuangan_Transaksi!A:J', [
      [
        record.id,
        record.date,
        `=IFERROR(ISOWEEKNUM(DATEVALUE("${record.date}")),ISOWEEKNUM(TODAY()))`,
        record.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        record.category,
        record.subCategory || '',
        record.note,
        record.amount,
        record.account,
        record.source || 'app',
      ],
    ]);
  } catch (err) {
    console.warn('Auto-sync finance row error:', err);
  }
};

// Auto-sync a KosMan Item to KosMan_Inventaris
export const autoSyncKosmanToSheets = async (item: KosItem) => {
  const token = getAccessToken();
  const sheetId = getSpreadsheetId();
  if (!token || !sheetId) return;

  try {
    const tagsStr = (item.tags && item.tags.length > 0 ? item.tags : [item.category]).join(', ');
    await appendSheetRow(token, sheetId, 'KosMan_Inventaris!A:M', [
      [
        item.id,
        item.name,
        item.category,
        tagsStr,
        item.subCategory,
        item.quantity,
        item.unit,
        item.minThreshold,
        item.price,
        item.quantity * item.price,
        item.quantity === 0 ? 'HABIS' : item.quantity <= item.minThreshold ? 'LOW' : 'AMAN',
        item.notes || '',
        item.lastPurchasedDate || new Date().toISOString().split('T')[0],
      ],
    ]);
  } catch (err) {
    console.warn('Auto-sync kosman row error:', err);
  }
};

// Auto-sync a Wishlist Item to Wishlist_Belanja
export const autoSyncWishlistToSheets = async (w: WishlistItem) => {
  const token = getAccessToken();
  const sheetId = getSpreadsheetId();
  if (!token || !sheetId) return;

  try {
    await appendSheetRow(token, sheetId, 'Wishlist_Belanja!A:J', [
      [
        w.id,
        w.name,
        w.shoppingCategory,
        w.subCategory || 'Umum',
        w.quantity,
        w.estimatedPrice,
        w.quantity * w.estimatedPrice,
        w.purchased,
        w.priority,
        w.source,
      ],
    ]);
  } catch (err) {
    console.warn('Auto-sync wishlist row error:', err);
  }
};

// Keep activity helper compatible
export const autoSyncActivityToSheets = async (activity: {
  id: string;
  date: string;
  type: string;
  title: string;
  info: string;
}) => {
  const token = getAccessToken();
  const sheetId = getSpreadsheetId();
  if (!token || !sheetId) return;
  try {
    await appendSheetRow(token, sheetId, 'Keuangan_Transaksi!A:J', [
      [activity.id, activity.date, `=ISOWEEKNUM(TODAY())`, 'Log', activity.type, '', `${activity.title} (${activity.info})`, 0, 'Kas', 'trip'],
    ]);
  } catch (err) {
    console.warn('Auto-sync activity row error:', err);
  }
};
