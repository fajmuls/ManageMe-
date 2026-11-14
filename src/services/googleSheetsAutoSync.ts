import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { TARGET_SPREADSHEET_ID } from '../data/initialAppData';
import { normalizeKosCategory } from '../data/kosmanItems';
import {
  KosItem,
  PurchaseHistoryEntry,
  WishlistItem,
  FinanceRecord,
  BudgetPos,
  BudgetConfig,
  KosCategory,
  RoutineActivity,
  MissedPrayer,
  DailyGoal,
  TripLog,
  WorkoutLog,
  NormalNote,
  IGNote,
  PersonalNote,
  WorshipPref,
} from '../types/kosman';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((s) => provider.addScope(s));
provider.setCustomParameters({ prompt: 'select_account' });

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedUserEmail: string | null = null;

export const getSpreadsheetId = (): string => {
  return localStorage.getItem('manageme_target_spreadsheet_id') || TARGET_SPREADSHEET_ID;
};

export const getSpreadsheetUrl = (): string => {
  return `https://docs.google.com/spreadsheets/d/${getSpreadsheetId()}/edit`;
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

const loadGisScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Browser window unavailable'));
    if ((window as any).google?.accounts?.oauth2) return resolve();
    const existing = document.querySelector('script[data-gis-client="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Gagal memuat Google Identity Services')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.gisClient = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Gagal memuat Google Identity Services'));
    document.head.appendChild(script);
  });

// Fallback langsung via Google Identity Services OAuth2 Token Client (memakai oAuthClientId, tanpa Firestore)
const requestGisTokenFallback = async (): Promise<{
  email: string;
  accessToken: string;
}> => {
  const clientId = (firebaseConfig as any).oAuthClientId;
  if (!clientId) {
    throw new Error('oAuthClientId belum tersedia di konfigurasi applet.');
  }
  await loadGisScript();
  const tokenResp = await new Promise<{ access_token: string }>((resolve, reject) => {
    const oauth2 = (window as any).google?.accounts?.oauth2;
    if (!oauth2) {
      reject(new Error('Google Identity OAuth2 tidak tersedia di browser ini.'));
      return;
    }
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: `${SCOPES.join(' ')} https://www.googleapis.com/auth/userinfo.email`,
      callback: (resp: any) => {
        if (resp?.error) {
          reject(new Error(resp.error_description || resp.error || 'OAuth dibatalkan'));
          return;
        }
        if (!resp?.access_token) {
          reject(new Error('Token akses Google tidak diterima.'));
          return;
        }
        resolve(resp);
      },
      error_callback: (err: any) => {
        reject(new Error(err?.message || 'Pop-up Google Login diblokir oleh browser.'));
      },
    });
    client.requestAccessToken({ prompt: 'consent select_account' });
  });

  let email = 'Google Account';
  try {
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenResp.access_token}` },
    });
    if (profileRes.ok) {
      const profile = await profileRes.json();
      if (profile?.email) email = profile.email;
    }
  } catch {
    // ignore userinfo failure; token is still valid for Sheets
  }

  return { email, accessToken: tokenResp.access_token };
};

export const initGoogleAuth = (
  onAuthSuccess?: (email: string, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Cek apakah baru kembali dari alur redirect login
  getRedirectResult(auth)
    .then((result) => {
      if (result) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          cachedAccessToken = credential.accessToken;
          cachedUserEmail = result.user.email || 'Google Account';
          if (onAuthSuccess) onAuthSuccess(cachedUserEmail, cachedAccessToken);
        }
      }
    })
    .catch(() => {});

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (cachedAccessToken) {
      const email = user?.email || cachedUserEmail || 'Google Account';
      cachedUserEmail = email;
      if (onAuthSuccess) onAuthSuccess(email, cachedAccessToken);
    } else if (!isSigningIn) {
      cachedAccessToken = null;
      cachedUserEmail = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{
  email: string;
  accessToken: string;
  spreadsheetId: string;
} | null> => {
  try {
    isSigningIn = true;
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('Token akses Google Sheets tidak diterima dari Firebase Auth');
      }
      cachedAccessToken = credential.accessToken;
      cachedUserEmail = result.user.email || 'Google Account';
      return {
        email: cachedUserEmail,
        accessToken: cachedAccessToken,
        spreadsheetId: getSpreadsheetId(),
      };
    } catch (firebaseErr: any) {
      const code = firebaseErr?.code || '';
      const shouldFallbackToGis =
        code === 'auth/unauthorized-domain' ||
        code === 'auth/operation-not-allowed' ||
        code === 'auth/internal-error' ||
        code === 'auth/web-storage-unsupported';

      if (shouldFallbackToGis) {
        const gis = await requestGisTokenFallback();
        cachedAccessToken = gis.accessToken;
        cachedUserEmail = gis.email;
        return {
          email: gis.email,
          accessToken: gis.accessToken,
          spreadsheetId: getSpreadsheetId(),
        };
      }

      if (code === 'auth/popup-blocked') {
        throw new Error(
          'Pop-up login diblokir oleh browser/iframe. Izinkan pop-up atau klik "Buka App di Tab Baru" di panel ini lalu coba Sign in lagi.'
        );
      }
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        throw new Error('Jendela login Google ditutup sebelum selesai. Silakan coba lagi.');
      }

      throw new Error(firebaseErr?.message || 'Gagal login Google Workspace.');
    }
  } finally {
    isSigningIn = false;
  }
};

export const googleSignInRedirect = async () => {
  await signInWithRedirect(auth, provider);
};

export const getAccessToken = (): string | null => cachedAccessToken;
export const getCurrentUser = (): User | null => auth.currentUser;
export const getConnectedEmail = (): string | null => cachedUserEmail || auth.currentUser?.email || null;

export const googleSignOut = async () => {
  await auth.signOut().catch(() => {});
  cachedAccessToken = null;
  cachedUserEmail = null;
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

export interface FullSpreadsheetPayload {
  items: KosItem[];
  wishlist: WishlistItem[];
  financeRecords: FinanceRecord[];
  budgetPos: BudgetPos[];
  budgetConfig: BudgetConfig;
  routines: RoutineActivity[];
  prayers: MissedPrayer[];
  goals: DailyGoal[];
  trips: TripLog[];
  workouts: WorkoutLog[];
  normalNotes: NormalNote[];
  igNotes: IGNote[];
  personalNotes: PersonalNote[];
  worshipPref: WorshipPref;
}

const TAB_NAMES = [
  'Dashboard_Ringkasan',
  'KosMan_Inventaris',
  'KosMan_Riwayat_Beli',
  'Wishlist_Belanja',
  'Keuangan_Transaksi',
  'Keuangan_Budget_Pos',
  'Kegiatan_Harian',
  'Catatan_Pribadi',
  'Waktu_Ibadah',
] as const;

// Build tab matrix helpers
const buildKosRows = (items: KosItem[]) => {
  const header = [
    'ID',
    'Nama_Item',
    'Kategori_Utama',
    'Multi_Tags',
    'Sub_Kategori',
    'Stok',
    'Satuan',
    'Min_Stok',
    'Total_Pengeluaran_Rp',
    'Jumlah_Beli_Kali',
    'Status_Stok',
    'Catatan',
    'Terakhir_Beli_Tgl_Jam',
  ];
  const rows = items.map((item, idx) => {
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
      item.totalSpend || 0,
      item.timesPurchased || 0,
      `=IF(F${r}=0,"HABIS",IF(F${r}<=H${r},"LOW","AMAN"))`,
      item.notes || '',
      item.lastPurchasedDate || '',
    ];
  });
  return [header, ...rows];
};

const buildKosHistoryRows = (items: KosItem[]) => {
  const header = [
    'ID_Riwayat',
    'ID_Item',
    'Nama_Item',
    'Tanggal_Jam',
    'Qty_Beli',
    'Total_Harga_Rp',
    'Rata_Rata_Unit',
    'Akun',
    'Catatan',
  ];
  const rows: any[][] = [];
  items.forEach((item) => {
    (item.purchaseHistory || []).forEach((h) => {
      const rowIdx = rows.length + 2;
      rows.push([
        h.id,
        item.id,
        item.name,
        h.purchasedAt,
        h.quantity,
        h.totalPrice,
        `=IF(E${rowIdx}>0,ROUND(F${rowIdx}/E${rowIdx},0),0)`,
        h.account,
        h.note || '',
      ]);
    });
  });
  return [header, ...rows];
};

const buildWishlistRows = (wishlist: WishlistItem[]) => {
  const header = [
    'ID',
    'Nama_Barang',
    'Kategori_Belanja',
    'Sub_Kategori',
    'Qty_Beli',
    'Satuan',
    'Estimasi_Total_Rp',
    'Sudah_Dibeli',
    'Prioritas',
    'Sumber',
  ];
  const rows = wishlist.map((w) => [
    w.id,
    w.name,
    w.shoppingCategory,
    w.subCategory || 'Umum',
    w.quantity,
    w.unit || 'buah',
    w.estimatedPrice,
    w.purchased,
    w.priority,
    w.source,
  ]);
  return [header, ...rows];
};

const buildFinanceRows = (financeRecords: FinanceRecord[]) => {
  const header = [
    'ID',
    'Tanggal',
    'Jam',
    'Minggu_Ke',
    'Tipe',
    'Kategori',
    'Sub_Kategori',
    'Keterangan',
    'Nominal_Rp',
    'Akun',
    'Sumber',
  ];
  const rows = financeRecords.map((f, idx) => {
    const r = idx + 2;
    return [
      f.id,
      f.date,
      f.time || '',
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
  return [header, ...rows];
};

const buildBudgetRows = (budgetPos: BudgetPos[], budgetConfig: BudgetConfig) => {
  const weeklyFactor = budgetConfig.periodType === 'monthly' ? 1 / 4 : 1;
  const header = [
    'ID',
    'Pos_Anggaran',
    'Rasio_Persen',
    'Periode_Pemasukan',
    'Pemasukan_Acuan_Rp',
    'Jatah_Mingguan_Rp',
    'Terpakai_Minggu_Ini',
    'Sisa_Budget',
    'Kategori_Terkait_Regex',
    'Status',
  ];
  const rows = budgetPos.map((p, idx) => {
    const r = idx + 2;
    const regexStr = p.linkedCategories.join('|');
    const calcWeekly = Math.round(budgetConfig.incomeAmount * weeklyFactor * (p.allocationPercent / 100));
    return [
      p.id,
      p.name,
      p.allocationPercent,
      budgetConfig.periodType === 'monthly' ? 'Bulanan' : 'Mingguan',
      budgetConfig.incomeAmount,
      calcWeekly,
      `=IFERROR(SUM(FILTER(Keuangan_Transaksi!$I$2:$I,Keuangan_Transaksi!$E$2:$E="Pengeluaran",Keuangan_Transaksi!$D$2:$D=ISOWEEKNUM(TODAY()),REGEXMATCH(Keuangan_Transaksi!$F$2:$F,I${r}))),0)`,
      `=F${r}-G${r}`,
      regexStr,
      `=IF(H${r}<0,"OVER","AMAN")`,
    ];
  });
  return [header, ...rows];
};

const buildActivitiesRows = (
  routines: RoutineActivity[],
  prayers: MissedPrayer[],
  goals: DailyGoal[],
  trips: TripLog[],
  workouts: WorkoutLog[]
) => {
  const header = ['ID', 'Jenis_Modul', 'Judul_Aktivitas', 'Kategori_Atau_Rute', 'Status_Atau_Durasi', 'Tanggal_Info', 'Payload_JSON'];
  const rows: any[][] = [];

  routines.forEach((r) =>
    rows.push([r.id, 'Rutinitas', r.name, r.category, r.completedToday ? 'Selesai' : 'Belum', new Date().toISOString().split('T')[0], JSON.stringify(r)])
  );
  prayers.forEach((p) =>
    rows.push([p.id, 'Qadha_Shalat', p.prayer, 'Ibadah', p.completed ? 'Sudah Diganti' : 'Belum', p.dateInfo, JSON.stringify(p)])
  );
  goals.forEach((g) =>
    rows.push([g.id, 'Target_Harian', g.text, g.category, g.completed ? 'Tercapai' : 'Aktif', new Date().toISOString().split('T')[0], JSON.stringify(g)])
  );
  trips.forEach((t) =>
    rows.push([t.id, 'Perjalanan', `${t.origin} -> ${t.destination}`, t.vehicle, `BBM:${t.fuelCost || 0} Tol:${t.tollCost || 0}`, t.date, JSON.stringify(t)])
  );
  workouts.forEach((w) =>
    rows.push([w.id, 'Workout', w.title, w.routine, `${w.durationMins} menit`, w.date, JSON.stringify(w)])
  );

  return [header, ...rows];
};

const buildNotesRows = (
  normalNotes: NormalNote[],
  igNotes: IGNote[],
  personalNotes: PersonalNote[]
) => {
  const header = ['ID', 'Jenis_Catatan', 'Judul_Atau_Nama', 'Kategori_Atau_Lagu', 'Isi_Ringkas', 'Diperbarui', 'Payload_JSON'];
  const rows: any[][] = [];

  normalNotes.forEach((n) =>
    rows.push([n.id, 'Umum', n.title, n.category || 'Umum', n.content, new Date(n.updatedAt).toISOString(), JSON.stringify(n)])
  );
  igNotes.forEach((ig) =>
    rows.push([ig.id, 'IG_Music', ig.owner, ig.songTitle, ig.content, new Date(ig.updatedAt).toISOString(), JSON.stringify(ig)])
  );
  personalNotes.forEach((p) =>
    rows.push([
      p.id,
      'Pribadi',
      p.personName,
      'Brankas/Kontak',
      `${p.extraNotes} | ${p.customFields.map((f) => `${f.key}: ${f.value}`).join(', ')}`,
      new Date(p.updatedAt).toISOString(),
      JSON.stringify(p),
    ])
  );

  return [header, ...rows];
};

const buildWorshipRows = (worshipPref: WorshipPref) => {
  return [
    ['Kunci', 'Nilai', 'Keterangan'],
    ['Kota_Default', worshipPref.city || 'Jakarta', 'Kota acuan jadwal shalat'],
    ['Portal_Web', worshipPref.portalUrl || 'https://waktuibadah.vercel.app', 'Website resmi waktu ibadah'],
    ['Terakhir_Sinkron', worshipPref.lastCheckedAt || new Date().toLocaleString('id-ID'), 'Timestamp pembaruan'],
  ];
};

// Full 9-tab relational schema setup with live formulas, freeze headers & filters
export const setupSpreadsheetDatabase = async (
  token: string,
  spreadsheetId: string,
  payload: FullSpreadsheetPayload
) => {
  const meta = await fetchSpreadsheetMetadata(token, spreadsheetId);
  const existingSheets: { title: string; sheetId: number }[] = (meta.sheets || []).map((s: any) => ({
    title: s.properties.title,
    sheetId: s.properties.sheetId,
  }));

  const addRequests = TAB_NAMES
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

  const updatedMeta = await fetchSpreadsheetMetadata(token, spreadsheetId);
  const tabMap: Record<string, number> = {};
  (updatedMeta.sheets || []).forEach((s: any) => {
    tabMap[s.properties.title] = s.properties.sheetId;
  });

  const dashboardRows = [
    ['MANAGEME! DATABASE TERPUSAT', 'NILAI LIVE', 'RUMUS / KETERANGAN'],
    ['Terakhir Disinkronkan', new Date().toLocaleString('id-ID'), 'Timestamp sinkronisasi otomatis'],
    ['Total Pemasukan (IDR)', '=SUMIF(Keuangan_Transaksi!E2:E,"Pemasukan",Keuangan_Transaksi!I2:I)', 'SUMIF seluruh pemasukan'],
    ['Total Pengeluaran (IDR)', '=SUMIF(Keuangan_Transaksi!E2:E,"Pengeluaran",Keuangan_Transaksi!I2:I)', 'SUMIF seluruh pengeluaran'],
    ['Saldo Kas Bersih (IDR)', '=B3-B4', 'Total Pemasukan - Total Pengeluaran'],
    ['Pengeluaran Minggu Ini (IDR)', '=SUMIFS(Keuangan_Transaksi!I2:I,Keuangan_Transaksi!E2:E,"Pengeluaran",Keuangan_Transaksi!D2:D,ISOWEEKNUM(TODAY()))', 'Pengeluaran ISOWEEKNUM minggu berjalan'],
    ['Total Belanja KosMan (Histori)', '=SUM(KosMan_Riwayat_Beli!F2:F)', 'Akumulasi seluruh riwayat pembelian KosMan'],
    ['Jumlah Barang KosMan HABIS', '=COUNTIF(KosMan_Inventaris!K2:K,"HABIS")', 'Item stok = 0'],
    ['Jumlah Barang KosMan LOW', '=COUNTIF(KosMan_Inventaris!K2:K,"LOW")', 'Item stok <= minimum'],
    ['Wishlist Belum Dibeli (Qty)', '=COUNTIF(Wishlist_Belanja!H2:H,FALSE)', 'Barang wishlist pending'],
    ['Total Jatah Budget Mingguan', '=SUM(Keuangan_Budget_Pos!F2:F)', 'Total alokasi rasio mingguan'],
    ['Total Catatan & Kegiatan', '=COUNTA(Kegiatan_Harian!A2:A)+COUNTA(Catatan_Pribadi!A2:A)', 'Total entri kegiatan + catatan'],
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ranges: [
        'Dashboard_Ringkasan!A1:C50',
        'KosMan_Inventaris!A1:M1000',
        'KosMan_Riwayat_Beli!A1:I2000',
        'Wishlist_Belanja!A1:J1000',
        'Keuangan_Transaksi!A1:K2000',
        'Keuangan_Budget_Pos!A1:J100',
        'Kegiatan_Harian!A1:G1000',
        'Catatan_Pribadi!A1:G1000',
        'Waktu_Ibadah!A1:C50',
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
          { range: 'KosMan_Inventaris!A1', values: buildKosRows(payload.items) },
          { range: 'KosMan_Riwayat_Beli!A1', values: buildKosHistoryRows(payload.items) },
          { range: 'Wishlist_Belanja!A1', values: buildWishlistRows(payload.wishlist) },
          { range: 'Keuangan_Transaksi!A1', values: buildFinanceRows(payload.financeRecords) },
          { range: 'Keuangan_Budget_Pos!A1', values: buildBudgetRows(payload.budgetPos, payload.budgetConfig) },
          {
            range: 'Kegiatan_Harian!A1',
            values: buildActivitiesRows(
              payload.routines,
              payload.prayers,
              payload.goals,
              payload.trips,
              payload.workouts
            ),
          },
          {
            range: 'Catatan_Pribadi!A1',
            values: buildNotesRows(payload.normalNotes, payload.igNotes, payload.personalNotes),
          },
          { range: 'Waktu_Ibadah!A1', values: buildWorshipRows(payload.worshipPref) },
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
    ['KosMan_Riwayat_Beli', 9],
    ['Wishlist_Belanja', 10],
    ['Keuangan_Transaksi', 11],
    ['Keuangan_Budget_Pos', 10],
    ['Kegiatan_Harian', 7],
    ['Catatan_Pribadi', 7],
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

// Pull (Read) 2-way sync from Google Spreadsheet across ALL modules
export const pullDatabaseFromSheets = async (
  token: string,
  spreadsheetId: string
): Promise<Partial<FullSpreadsheetPayload> & { counts: Record<string, number> }> => {
  const ranges = [
    'KosMan_Inventaris!A2:M1000',
    'KosMan_Riwayat_Beli!A2:I2000',
    'Wishlist_Belanja!A2:J1000',
    'Keuangan_Transaksi!A2:K2000',
    'Keuangan_Budget_Pos!A2:J100',
    'Kegiatan_Harian!A2:G1000',
    'Catatan_Pribadi!A2:G1000',
    'Waktu_Ibadah!A2:C20',
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

  // 1. Parse Purchase History grouped by item ID or name
  const rawHist: any[][] = valueRanges[1]?.values || [];
  const histByItemId: Record<string, PurchaseHistoryEntry[]> = {};
  rawHist
    .filter((row) => row[2] || row[1])
    .forEach((row, i) => {
      const key = String(row[1] || row[2] || '').trim();
      if (!histByItemId[key]) histByItemId[key] = [];
      histByItemId[key].push({
        id: String(row[0] || `hist-${Date.now()}-${i}`),
        purchasedAt: String(row[3] || ''),
        quantity: Math.max(1, parseNum(row[4])),
        totalPrice: parseNum(row[5]),
        account: (['Kas', 'Bank', 'E-Wallet'].includes(String(row[7])) ? String(row[7]) : 'Kas') as any,
        note: String(row[8] || ''),
      });
    });

  // 2. Parse KosMan_Inventaris
  const rawKos: any[][] = valueRanges[0]?.values || [];
  const items: KosItem[] = rawKos
    .filter((row) => row[1])
    .map((row, i) => {
      const id = String(row[0] || `sheet-item-${Date.now()}-${i}`);
      const name = String(row[1]).trim();
      const cat = normalizeKosCategory(row[2]);
      const tagsRaw = String(row[3] || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map(normalizeKosCategory);
      const tags: KosCategory[] = tagsRaw.length > 0 ? Array.from(new Set(tagsRaw)) : [cat];
      const history = histByItemId[id] || histByItemId[name] || [];

      return {
        id,
        name,
        category: cat,
        tags,
        subCategory: String(row[4] || 'Umum').trim(),
        quantity: parseNum(row[5]),
        unit: String(row[6] || 'buah').trim(),
        minThreshold: parseNum(row[7]) || 1,
        price: 0,
        totalSpend: parseNum(row[8]),
        timesPurchased: parseNum(row[9]) || history.length,
        notes: String(row[11] || ''),
        lastPurchasedDate: String(row[12] || ''),
        purchaseHistory: history,
      };
    });

  // 3. Parse Wishlist_Belanja
  const rawWish: any[][] = valueRanges[2]?.values || [];
  const wishlist: WishlistItem[] = rawWish
    .filter((row) => row[1])
    .map((row, i) => ({
      id: String(row[0] || `sheet-wish-${Date.now()}-${i}`),
      name: String(row[1]).trim(),
      shoppingCategory: normalizeKosCategory(row[2]),
      subCategory: String(row[3] || 'Umum').trim(),
      quantity: Math.max(1, parseNum(row[4])),
      unit: String(row[5] || 'buah').trim(),
      estimatedPrice: parseNum(row[6]),
      purchased: String(row[7] || '').toUpperCase() === 'TRUE',
      priority: (['Wajib', 'Sedang', 'Keinginan'].includes(String(row[8])) ? String(row[8]) : 'Sedang') as any,
      source: (String(row[9] || 'sheets') as any),
      createdAt: Date.now() - i,
    }));

  // 4. Parse Keuangan_Transaksi
  const rawFin: any[][] = valueRanges[3]?.values || [];
  const financeRecords: FinanceRecord[] = rawFin
    .filter((row) => row[7] || row[8])
    .map((row, i) => {
      const tipeRaw = String(row[4] || '').toLowerCase();
      const type = tipeRaw.includes('masuk') || tipeRaw === 'income' ? 'income' : 'expense';
      const accRaw = String(row[9] || 'Kas');
      const account = (['Kas', 'Bank', 'E-Wallet'].includes(accRaw) ? accRaw : 'Kas') as any;

      return {
        id: String(row[0] || `sheet-fin-${Date.now()}-${i}`),
        date: String(row[1] || new Date().toISOString().split('T')[0]),
        time: String(row[2] || ''),
        type,
        category: String(row[5] || 'Lainnya').trim(),
        subCategory: String(row[6] || '').trim(),
        note: String(row[7] || 'Transaksi Sheets').trim(),
        amount: parseNum(row[8]),
        account,
        source: (String(row[10] || 'sheets') as any),
        createdAt: Date.now() - i * 1000,
      };
    });

  // 5. Parse Keuangan_Budget_Pos
  const rawBudget: any[][] = valueRanges[4]?.values || [];
  const palette = ['#FFD000', '#00E5FF', '#FF4B82', '#A3E635', '#A855F7'];
  let budgetConfig: BudgetConfig | undefined;
  const budgetPos: BudgetPos[] = rawBudget
    .filter((row) => row[1])
    .map((row, i) => {
      if (i === 0 && (row[3] || row[4])) {
        budgetConfig = {
          periodType: String(row[3]).toLowerCase().includes('minggu') ? 'weekly' : 'monthly',
          incomeAmount: parseNum(row[4]) || 1500000,
        };
      }
      return {
        id: String(row[0] || `pos-${i}`),
        name: String(row[1]).trim(),
        allocationPercent: parseNum(row[2]),
        weeklyTarget: parseNum(row[5]),
        linkedCategories: String(row[8] || row[1])
          .split('|')
          .map((s) => s.trim())
          .filter(Boolean),
        color: palette[i % palette.length],
      };
    });

  // 6. Parse Kegiatan_Harian
  const rawAct: any[][] = valueRanges[5]?.values || [];
  const routines: RoutineActivity[] = [];
  const prayers: MissedPrayer[] = [];
  const goals: DailyGoal[] = [];
  const trips: TripLog[] = [];
  const workouts: WorkoutLog[] = [];

  rawAct.forEach((row) => {
    try {
      if (row[6]) {
        const parsed = JSON.parse(row[6]);
        if (row[1] === 'Rutinitas') routines.push(parsed);
        if (row[1] === 'Qadha_Shalat') prayers.push(parsed);
        if (row[1] === 'Target_Harian') goals.push(parsed);
        if (row[1] === 'Perjalanan') trips.push(parsed);
        if (row[1] === 'Workout') workouts.push(parsed);
      }
    } catch {
      // ignore malformed JSON row
    }
  });

  // 7. Parse Catatan_Pribadi
  const rawNotes: any[][] = valueRanges[6]?.values || [];
  const normalNotes: NormalNote[] = [];
  const igNotes: IGNote[] = [];
  const personalNotes: PersonalNote[] = [];

  rawNotes.forEach((row) => {
    try {
      if (row[6]) {
        const parsed = JSON.parse(row[6]);
        if (row[1] === 'Umum') normalNotes.push(parsed);
        if (row[1] === 'IG_Music') igNotes.push(parsed);
        if (row[1] === 'Pribadi') personalNotes.push(parsed);
      }
    } catch {
      // ignore
    }
  });

  // 8. Parse Waktu_Ibadah
  const rawWorship: any[][] = valueRanges[7]?.values || [];
  let worshipPref: WorshipPref | undefined;
  if (rawWorship.length > 0) {
    const cityRow = rawWorship.find((r) => String(r[0]).includes('Kota'));
    const portalRow = rawWorship.find((r) => String(r[0]).includes('Portal'));
    worshipPref = {
      city: cityRow?.[1] || 'Jakarta',
      portalUrl: portalRow?.[1] || 'https://waktuibadah.vercel.app',
    };
  }

  return {
    items,
    wishlist,
    financeRecords,
    budgetPos,
    budgetConfig,
    routines: routines.length > 0 ? routines : undefined,
    prayers: prayers.length > 0 ? prayers : undefined,
    goals: goals.length > 0 ? goals : undefined,
    trips: trips.length > 0 ? trips : undefined,
    workouts: workouts.length > 0 ? workouts : undefined,
    normalNotes: normalNotes.length > 0 ? normalNotes : undefined,
    igNotes: igNotes.length > 0 ? igNotes : undefined,
    personalNotes: personalNotes.length > 0 ? personalNotes : undefined,
    worshipPref,
    counts: {
      items: items.length,
      wishlist: wishlist.length,
      finance: financeRecords.length,
      activities: rawAct.length,
      notes: rawNotes.length,
    },
  };
};

// Generic helper to replace a single tab cleanly during live online auto-sync
const syncTabValues = async (tabName: string, clearRange: string, values: any[][]) => {
  const token = getAccessToken();
  const sheetId = getSpreadsheetId();
  if (!token || !sheetId || !navigator.onLine) return;

  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(clearRange)}:clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(`${tabName}!A1`)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      }
    );
  } catch (err) {
    console.warn(`Live auto-sync (${tabName}) skipped/error:`, err);
  }
};

export const autoSyncKosmanFullToSheets = (items: KosItem[]) => {
  syncTabValues('KosMan_Inventaris', 'KosMan_Inventaris!A1:M1000', buildKosRows(items));
  syncTabValues('KosMan_Riwayat_Beli', 'KosMan_Riwayat_Beli!A1:I2000', buildKosHistoryRows(items));
};

export const autoSyncWishlistFullToSheets = (wishlist: WishlistItem[]) => {
  syncTabValues('Wishlist_Belanja', 'Wishlist_Belanja!A1:J1000', buildWishlistRows(wishlist));
};

export const autoSyncFinanceFullToSheets = (financeRecords: FinanceRecord[]) => {
  syncTabValues('Keuangan_Transaksi', 'Keuangan_Transaksi!A1:K2000', buildFinanceRows(financeRecords));
};

export const autoSyncBudgetFullToSheets = (budgetPos: BudgetPos[], budgetConfig: BudgetConfig) => {
  syncTabValues('Keuangan_Budget_Pos', 'Keuangan_Budget_Pos!A1:J100', buildBudgetRows(budgetPos, budgetConfig));
};

export const autoSyncActivitiesFullToSheets = (
  routines: RoutineActivity[],
  prayers: MissedPrayer[],
  goals: DailyGoal[],
  trips: TripLog[],
  workouts: WorkoutLog[]
) => {
  syncTabValues('Kegiatan_Harian', 'Kegiatan_Harian!A1:G1000', buildActivitiesRows(routines, prayers, goals, trips, workouts));
};

export const autoSyncNotesFullToSheets = (
  normalNotes: NormalNote[],
  igNotes: IGNote[],
  personalNotes: PersonalNote[]
) => {
  syncTabValues('Catatan_Pribadi', 'Catatan_Pribadi!A1:G1000', buildNotesRows(normalNotes, igNotes, personalNotes));
};

export const autoSyncWorshipToSheets = (pref: WorshipPref) => {
  syncTabValues('Waktu_Ibadah', 'Waktu_Ibadah!A1:C20', buildWorshipRows(pref));
};
