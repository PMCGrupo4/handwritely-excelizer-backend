import { Router } from 'express';
import { createWorker } from 'tesseract.js';
import * as XLSX from 'xlsx';
import { AppError } from '../middleware/error.middleware';
import multer from 'multer';
import * as fs from 'fs';

const router = Router();

// Configuración de multer para manejo de archivos
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = './uploads';
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Procesar imagen y generar Excel
router.post('/process', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No se proporcionó ninguna imagen', 400);
    }

    // Inicializar worker de Tesseract
    const worker = await createWorker('spa');

    // Procesar la imagen
    const { data: { text } } = await worker.recognize(req.file.path);
    await worker.terminate();

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([['Texto Extraído'], [text]]);
    XLSX.utils.book_append_sheet(wb, ws, 'Texto');

    // Generar archivo Excel
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = 'texto_extraido.xlsx';

    // Limpiar archivo temporal
    fs.unlinkSync(req.file.path);

    // Enviar respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(excelBuffer);
  } catch (error) {
    next(error);
  }
});

export default router; 