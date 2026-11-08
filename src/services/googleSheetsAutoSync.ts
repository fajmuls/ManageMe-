import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let currentSpreadsheetId: string | null = localStorage.getItem('manageme_google_spreadsheet_id');

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn && onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string; spreadsheetId: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google Sign-In');
    }

    cachedAccessToken = credential.accessToken;
    
    // Auto-setup or find Spreadsheet database
    const spreadsheetId = await getOrCreateSpreadsheet(cachedAccessToken);
    currentSpreadsheetId = spreadsheetId;
    localStorage.setItem('manageme_google_spreadsheet_id', spreadsheetId);

    return { user: result.user, accessToken: cachedAccessToken, spreadsheetId };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getSpreadsheetId = (): string | null => {
  return currentSpreadsheetId;
};

export const googleSignOut = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Check Google Drive for "Fajmuls Daily OS Database" or create it automatically
export const getOrCreateSpreadsheet = async (token: string): Promise<string> => {
  try {
    // 1. Search Google Drive for file named "Fajmuls Daily OS Database"
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='Fajmuls Daily OS Database' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const searchData = await searchRes.json();

    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // 2. Create new Google Spreadsheet workbook if not found
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: 'Fajmuls Daily OS Database',
        },
        sheets: [
          { properties: { title: 'Keuangan' } },
          { properties: { title: 'Kosman' } },
          { properties: { title: 'Kegiatan' } },
        ],
      }),
    });

    const createData = await createRes.json();
    const newId = createData.spreadsheetId;

    // 3. Write Header Rows in the new spreadsheet
    await appendSheetRow(token, newId, 'Keuangan!A1:F1', [
      ['ID Transaksi', 'Tanggal', 'Tipe', 'Kategori', 'Nominal (IDR)', 'Catatan / Akun']
    ]);
    await appendSheetRow(token, newId, 'Kosman!A1:F1', [
      ['ID Item', 'Nama Barang', 'Kategori', 'Sub-Kategori', 'Kuantitas Stok', 'Harga (IDR)']
    ]);
    await appendSheetRow(token, newId, 'Kegiatan!A1:E1', [
      ['ID Log', 'Tanggal', 'Tipe Kegiatan', 'Judul / Detail', 'Biaya / Durasi']
    ]);

    return newId;
  } catch (err) {
    console.error('Error auto-creating Google Spreadsheet:', err);
    throw err;
  }
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

// Auto-sync a new Finance Record to Google Sheets
export const autoSyncFinanceToSheets = async (record: {
  id: string;
  date: string;
  type: string;
  category: string;
  amount: number;
  note: string;
  account: string;
}) => {
  const token = getAccessToken();
  const sheetId = getSpreadsheetId();
  if (!token || !sheetId) return;

  try {
    await appendSheetRow(token, sheetId, 'Keuangan!A:F', [
      [record.id, record.date, record.type === 'income' ? 'Pemasukan' : 'Pengeluaran', record.category, record.amount, `${record.note} (${record.account})`]
    ]);
  } catch (err) {
    console.warn('Auto-sync finance row error:', err);
  }
};

// Auto-sync a KosMan Item to Google Sheets
export const autoSyncKosmanToSheets = async (item: {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  quantity: number;
  price: number;
}) => {
  const token = getAccessToken();
  const sheetId = getSpreadsheetId();
  if (!token || !sheetId) return;

  try {
    await appendSheetRow(token, sheetId, 'Kosman!A:F', [
      [item.id, item.name, item.category, item.subCategory, item.quantity, item.price]
    ]);
  } catch (err) {
    console.warn('Auto-sync kosman row error:', err);
  }
};

// Auto-sync an Activity / Trip to Google Sheets
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
    await appendSheetRow(token, sheetId, 'Kegiatan!A:E', [
      [activity.id, activity.date, activity.type, activity.title, activity.info]
    ]);
  } catch (err) {
    console.warn('Auto-sync activity row error:', err);
  }
};
