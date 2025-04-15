"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const command_routes_1 = require("./routes/command.routes");
const auth_middleware_1 = require("./middleware/auth.middleware");
const storage_config_1 = require("./config/storage.config");
const tesseract_js_1 = require("tesseract.js");
const XLSX = __importStar(require("xlsx"));
const formidable_1 = __importDefault(require("formidable"));
const fs_1 = __importDefault(require("fs"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
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
app.use('/api/commands', auth_middleware_1.authMiddleware, upload.single('image'), command_routes_1.commandRoutes);
// Ruta para procesar imágenes
app.post('/api/process-image', async (req, res) => {
    var _a;
    const form = (0, formidable_1.default)();
    try {
        const [fields, files] = await form.parse(req);
        const file = (_a = files.image) === null || _a === void 0 ? void 0 : _a[0];
        if (!file) {
            return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
        }
        // Inicializar worker de Tesseract
        const worker = await (0, tesseract_js_1.createWorker)();
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
        fs_1.default.unlinkSync(file.filepath);
    }
    catch (error) {
        console.error('Error al procesar la imagen:', error);
        res.status(500).json({ error: 'Error al procesar la imagen' });
    }
});
// Initialize storage on startup
(0, storage_config_1.initializeStorage)()
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
//# sourceMappingURL=index.js.map