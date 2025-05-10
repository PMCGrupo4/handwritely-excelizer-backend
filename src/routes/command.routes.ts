import { Router } from 'express';
import multer from 'multer';
import { CommandController } from '../controllers/command.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const commandController = new CommandController();

// OCR route - without auth for testing purposes
router.post('/ocr', upload.single('image'), commandController.processImageOcr.bind(commandController));

// Apply auth middleware to all other routes
router.use(authMiddleware);

// Get all commands for a user
router.get('/:userId', commandController.getUserCommands);

// Create a new command
router.post('/', upload.single('image'), commandController.createCommand);

// Delete a command
router.delete('/:id', commandController.deleteCommand);

// Edit a command
router.put('/:id', commandController.editCommand);

export const commandRoutes = router; 