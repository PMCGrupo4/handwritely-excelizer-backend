import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { commandRoutes } from './routes/command.routes';
import { authMiddleware } from './middleware/auth.middleware';
import { initializeStorage } from './config/storage.config';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/commands', commandRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize storage on startup
initializeStorage()
  .then(() => {
    console.log('Storage initialization completed');
  })
  .catch(error => {
    console.error('Failed to initialize storage:', error);
  });

export default app;
