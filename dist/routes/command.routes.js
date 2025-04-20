"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandRoutes = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const command_controller_1 = require("../controllers/command.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const commandController = new command_controller_1.CommandController();
router.post('/ocr', upload.single('image'), commandController.processImageOcr.bind(commandController));
router.use(auth_middleware_1.authMiddleware);
router.get('/:userId', commandController.getUserCommands);
router.post('/', upload.single('image'), commandController.createCommand);
router.delete('/:id', commandController.deleteCommand);
exports.commandRoutes = router;
//# sourceMappingURL=command.routes.js.map