import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Gemini SDK Server Initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Route 1: AI OCR Receipt / Nota Scanner using gemini-4-hydrogen
app.post('/api/gemini/ocr', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Base64 image data is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: `Analisis foto struk/nota/kuitansi belanja ini secara teliti. Ekstrak nama toko, total keseluruhan nominal yang dibayar (dalam angka IDR bulat), tanggal transaksi (format YYYY-MM-DD, jika tidak terbaca gunakan hari ini), jam transaksi (format HH:mm, jika tidak ada isi 12:00), kategori transaksi utama (pilih salah satu: Makan & Minum, Belanja KosMan, Bumbu Dapur, Keperluan Rumah Tangga, Kebersihan & Toilet, Kesehatan, Kelistrikan & Kos, Keinginan, Transportasi, Lainnya), ringkasan singkat, dan daftar tiap item yang dibeli beserta total harga baris item tersebut.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            storeName: { type: Type.STRING, description: 'Nama toko atau minimarket' },
            totalAmount: { type: Type.NUMBER, description: 'Total harga pembayaran keseluruhan dalam IDR' },
            date: { type: Type.STRING, description: 'Tanggal transaksi format YYYY-MM-DD' },
            time: { type: Type.STRING, description: 'Jam transaksi format HH:mm' },
            category: { type: Type.STRING, description: 'Kategori pengeluaran utama' },
            note: { type: Type.STRING, description: 'Ringkasan singkat belanja' },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  price: { type: Type.NUMBER, description: 'Total harga untuk item ini pada nota' },
                  suggestedCategory: { type: Type.STRING },
                  subCategory: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const textOutput = (response.text || '{}').trim();
    const parsedData = JSON.parse(textOutput);
    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Gemini OCR Error:', error);
    return res.status(500).json({
      error: 'Gagal memproses gambar nota dengan Gemini AI OCR',
      details: error?.message || String(error),
    });
  }
});

// API Route 2: AI Shelf / Pantry Stock Scanner using gemini-4-hydrogen
app.post('/api/gemini/scan-stock', async (req, res) => {
  try {
    const { imageBase64, mimeType, existingItemNames } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Base64 image data is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const hintList = Array.isArray(existingItemNames) && existingItemNames.length > 0
      ? `Daftar nama barang yang sudah ada di inventaris pengguna (gunakan nama ini jika cocok): ${existingItemNames.slice(0, 60).join(', ')}.`
      : '';

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: `Analisis foto isi kulkas, rak dapur, lemari kamar kos, atau meja barang ini. Identifikasi semua barang kebutuhan kos yang terlihat beserta perkiraan jumlah stoknya (angka integer >= 0), satuan (bungkus/botol/buah/galon/sachet/box), dan kategori paling sesuai dari: Makanan, Minuman, Bumbu Dapur, Kebersihan & Toilet, Kesehatan, Keperluan Rumah Tangga, Kelistrikan & Kos, Alat Tulis, Keinginan, Belanja. ${hintList}`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'Ringkasan kondisi rak/stok yang terlihat' },
            detectedItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  category: { type: Type.STRING },
                  subCategory: { type: Type.STRING },
                  conditionNote: { type: Type.STRING, description: 'Catatan kondisi stok (misal: sisa setengah, masih penuh)' },
                },
              },
            },
          },
        },
      },
    });

    const textOutput = (response.text || '{}').trim();
    const parsedData = JSON.parse(textOutput);
    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Gemini Scan Stock Error:', error);
    return res.status(500).json({
      error: 'Gagal menganalisis foto stok dengan Gemini AI',
      details: error?.message || String(error),
    });
  }
});

// Vite Middleware for Dev mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const fs = await import('fs/promises');
        const rawHtml = await fs.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');
        const template = await vite.transformIndexHtml(url, rawHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`ManageMe! full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
