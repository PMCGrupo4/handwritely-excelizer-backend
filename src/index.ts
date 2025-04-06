import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
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

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
});

// Routes
app.use('/api/commands', authMiddleware, upload.single('image'), commandRoutes);

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