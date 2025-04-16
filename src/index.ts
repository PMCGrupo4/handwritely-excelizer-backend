import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { errorHandler } from './middleware/error.middleware';
import { authenticateToken } from './middleware/auth.middleware';
import authRoutes from './routes/auth.routes';
import ocrRoutes from './routes/ocr.routes';
import commandRoutes from './routes/command.routes';
import { initializeDirectories } from './utils/init';

// Cargar variables de entorno
dotenv.config();

// Inicializar directorios
initializeDirectories();

// Crear cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Crear aplicación Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de autenticación
app.use('/auth', authRoutes);

// Rutas protegidas
app.use('/api', authenticateToken);

// Rutas
app.use('/api/ocr', ocrRoutes);
app.use('/api/commands', commandRoutes);

// Rutas públicas para pruebas
app.use('/public/ocr', ocrRoutes);
app.use('/public/commands', commandRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 