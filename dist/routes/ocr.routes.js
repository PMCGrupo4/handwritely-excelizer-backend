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
const express_1 = require("express");
const tesseract_js_1 = require("tesseract.js");
const XLSX = __importStar(require("xlsx"));
const error_middleware_1 = require("../middleware/error.middleware");
const multer_1 = __importDefault(require("multer"));
const fs = __importStar(require("fs"));
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});
router.post('/process', upload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) {
            throw new error_middleware_1.AppError('No se proporcionó ninguna imagen', 400);
        }
        const worker = await (0, tesseract_js_1.createWorker)('spa');
        const { data: { text } } = await worker.recognize(req.file.path);
        await worker.terminate();
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([['Texto Extraído'], [text]]);
        XLSX.utils.book_append_sheet(wb, ws, 'Texto');
        const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        const filename = 'texto_extraido.xlsx';
        fs.unlinkSync(req.file.path);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(excelBuffer);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=ocr.routes.js.map