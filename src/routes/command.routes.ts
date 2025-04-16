import { Router } from 'express';
import { CommandController } from '../controllers/command.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const commandController = new CommandController();

// Rutas protegidas que requieren autenticación
router.use(authenticateToken);

// Crear un nuevo comando
router.post('/', (req, res) => commandController.createCommand(req, res));

// Obtener un comando por ID
router.get('/:id', (req, res) => commandController.getCommand(req, res));

// Eliminar un comando
router.delete('/:id', (req, res) => commandController.deleteCommand(req, res));

export default router; 