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

// API Route: AI OCR Receipt Scanner using gemini-4-hydrogen
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
            text: `Analisis foto struk/nota/kuitansi belanja ini secara teliti. Ekstrak nama toko, total nominal (dalam angka IDR bulat), tanggal transaksi (format YYYY-MM-DD, jika tidak terbaca gunakan hari ini), kategori transaksi utama (pilih salah satu: Makan & Minum, Belanja KosMan, Bumbu Dapur, Keperluan Rumah Tangga, Kebersihan & Toilet, Kesehatan, Listrik & Utilitas, Keinginan, Lainnya), ringkasan singkat, dan daftar tiap item yang dibeli.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            storeName: { type: Type.STRING, description: 'Nama toko atau minimarket' },
            totalAmount: { type: Type.NUMBER, description: 'Total harga pembayaran dalam IDR' },
            date: { type: Type.STRING, description: 'Tanggal transaksi format YYYY-MM-DD' },
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
                  price: { type: Type.NUMBER },
                  suggestedCategory: { type: Type.STRING },
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
