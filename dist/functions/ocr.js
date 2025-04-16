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
exports.handler = void 0;
const formidable_1 = __importDefault(require("formidable"));
const tesseract_js_1 = require("tesseract.js");
const XLSX = __importStar(require("xlsx"));
const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
    try {
        const form = (0, formidable_1.default)();
        const [fields, files] = await form.parse(event.body || '');
        if (!files.file || files.file.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No file provided' }),
            };
        }
        const file = files.file[0];
        const worker = await (0, tesseract_js_1.createWorker)();
        const { data: { text } } = await worker.recognize(file.filepath);
        await worker.terminate();
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([text.split('\n')]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'OCR Result');
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=ocr-result.xlsx',
            },
            body: excelBuffer.toString('base64'),
            isBase64Encoded: true,
        };
    }
    catch (error) {
        console.error('Error processing file:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=ocr.js.map