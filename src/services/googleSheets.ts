import { KosItem, KosCategory } from '../types/kosman';

export interface SyncResult {
  success: boolean;
  message: string;
  count?: number;
}

// Convert KosMan items list to CSV string
export const exportToCSV = (items: KosItem[]): string => {
  const headers = ['ID', 'Nama Barang', 'Kategori', 'Sub Kategori', 'Stok Quantity', 'Satuan', 'Harga Satuan (Rp)', 'Frekuensi Dibeli', 'Total Pengeluaran (Rp)', 'Batas Stok Menipis', 'Tanggal Pembelian Terakhir', 'Catatan'];
  
  const rows = items.map(item => [
    item.id,
    `"${item.name.replace(/"/g, '""')}"`,
    `"${item.category}"`,
    `"${item.subCategory}"`,
    item.quantity,
    `"${item.unit}"`,
    item.price,
    item.timesPurchased,
    item.totalSpend,
    item.minThreshold,
    item.lastPurchasedDate,
    `"${(item.notes || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

// Download CSV file to desktop/user browser
export const downloadCSV = (items: KosItem[], filename = 'KosMan_Inventaris_GoogleSheets.csv') => {
  const csvContent = exportToCSV(items);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Push inventory data directly to Google Sheets via Google Sheets REST API
export const pushToGoogleSheets = async (
  spreadsheetId: string, 
  accessToken: string, 
  items: KosItem[]
): Promise<SyncResult> => {
  if (!spreadsheetId.trim()) {
    return { success: false, message: 'Spreadsheet ID belum diisi.' };
  }

  try {
    const range = 'Sheet1!A1:K' + (items.length + 1);
    const values = [
      ['ID', 'Nama Barang', 'Kategori', 'Stok Quantity', 'Satuan', 'Harga Satuan (Rp)', 'Frekuensi Dibeli', 'Total Pengeluaran (Rp)', 'Batas Stok Menipis', 'Tanggal Pembelian Terakhir', 'Catatan'],
      ...items.map(item => [
        item.id,
        item.name,
        item.category,
        item.quantity,
        item.unit,
        item.price,
        item.timesPurchased,
        item.totalSpend,
        item.minThreshold,
        item.lastPurchasedDate,
        item.notes || ''
      ])
    ];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      }
    );

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Google Sheets API return HTTP ${response.status}`);
    }

    return { 
      success: true, 
      message: `Berhasil menyinkronkan ${items.length} item ke Google Sheets!`,
      count: items.length 
    };
  } catch (error: any) {
    console.error('Push to Google Sheets error:', error);
    return { 
      success: false, 
      message: error.message || 'Gagal mengirim data ke Google Sheets.' 
    };
  }
};

// Pull inventory data from Google Sheets API
export const pullFromGoogleSheets = async (
  spreadsheetId: string, 
  accessToken: string
): Promise<{ success: boolean; message: string; items?: KosItem[] }> => {
  if (!spreadsheetId.trim()) {
    return { success: false, message: 'Spreadsheet ID belum diisi.' };
  }

  try {
    const range = 'Sheet1!A2:K300';
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Google Sheets API error HTTP ${response.status}`);
    }

    const data = await response.json();
    const rows: any[][] = data.values || [];

    if (rows.length === 0) {
      return { success: false, message: 'Spreadsheet kosong atau tidak ada data baris.' };
    }

    const parsedItems: KosItem[] = rows.map((row, idx) => ({
      id: row[0] || `gs-${idx + 1}`,
      name: row[1] || 'Item Tanpa Nama',
      category: (row[2] as KosCategory) || 'Bumbu Dapur',
      subCategory: row[3] || 'Umum',
      quantity: parseInt(row[4]) || 0,
      unit: row[5] || 'buah',
      price: parseInt(row[6]) || 0,
      timesPurchased: parseInt(row[7]) || 0,
      totalSpend: parseInt(row[8]) || 0,
      minThreshold: parseInt(row[9]) || 1,
      lastPurchasedDate: row[10] || new Date().toISOString().split('T')[0],
      notes: row[11] || ''
    }));

    return {
      success: true,
      message: `Berhasil menarik ${parsedItems.length} item dari Google Sheets!`,
      items: parsedItems
    };
  } catch (error: any) {
    console.error('Pull from Google Sheets error:', error);
    return {
      success: false,
      message: error.message || 'Gagal menarik data dari Google Sheets.'
    };
  }
};

// Parse raw receipt string (e.g., entered by user or returned by ChatGPT) into KosMan items format
export const parseShoppingListText = (text: string): Partial<KosItem>[] => {
  const lines = text.split('\n');
  const results: Partial<KosItem>[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;

    // Pattern matching e.g.: "2 Masako Ayam Rp 10000" or "Galon Aqua (1) 20000"
    const qtyMatch = trimmed.match(/^(\d+)\s*x?\s+(.+)/i) || trimmed.match(/^(.+?)\s+(\d+)\s*(pcs|botol|bungkus|galon|pack)?/i);
    if (qtyMatch) {
      results.push({
        name: trimmed,
        quantity: 1,
        price: 0
      });
    }
  }

  return results;
};
