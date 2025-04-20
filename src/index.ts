import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { commandRoutes } from './routes/command.routes';
import { authMiddleware } from './middleware/auth.middleware';
import { initializeStorage } from './config/storage.config';
import { createWorker, Worker } from 'tesseract.js';
import * as XLSX from 'xlsx';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
});

// Routes
app.use('/api/commands', authMiddleware, upload.single('image'), commandRoutes);

// Ruta para procesar imágenes
app.post('/api/process-image', async (req: Request, res: Response) => {
  const form = formidable();

  try {
    const [fields, files] = await form.parse(req as any);
    const file = files.image?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }

    // Inicializar worker de Tesseract
    const worker = await createWorker();
    await worker.reinitialize('spa');
    
    // Procesar la imagen
    const { data: { text } } = await worker.recognize(file.filepath);
    await worker.terminate();

    // Convertir el texto a formato Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([['Texto Extraído'], [text]]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Texto');

    // Generar el archivo Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Enviar el archivo Excel como respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=texto_extraido.xlsx');
    res.send(excelBuffer);

    // Limpiar el archivo temporal
    fs.unlinkSync(file.filepath);
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
});

// Initialize storage on startup
initializeStorage()
  .then(() => {
    console.log('Storage initialization completed');
    
    // Start server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize storage:', error);
    process.exit(1);
  }); 