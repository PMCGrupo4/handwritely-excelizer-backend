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
exports.OcrService = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const tesseract_js_1 = require("tesseract.js");
dotenv_1.default.config();
class OcrService {
    constructor() {
        this.projectId = process.env.GOOGLE_PROJECT_ID;
        try {
            if (!process.env.GOOGLE_CLOUD_CREDENTIALS) {
                const credentialsPath = path.join(process.cwd(), 'credentials', 'google-cloud-credentials.json');
                if (!fs.existsSync(credentialsPath)) {
                    throw new Error('No se encontraron las credenciales de Google Cloud');
                }
            }
        }
        catch (error) {
            console.error('Error parsing GOOGLE_CLOUD_CREDENTIALS:', error);
            throw new Error('Invalid GOOGLE_CLOUD_CREDENTIALS format');
        }
        console.log('OCR Service initialized with project:', this.projectId);
        this.initializeWorker();
    }
    async initializeWorker() {
        this.worker = await (0, tesseract_js_1.createWorker)('spa');
    }
    async processImage(imageBuffer) {
        try {
            if (!this.worker) {
                await this.initializeWorker();
            }
            const { data: { text, confidence } } = await this.worker.recognize(imageBuffer);
            const items = this.extractItems(text);
            const total = this.extractTotal(text);
            const currency = this.extractCurrency(text);
            return {
                receipt: {
                    items,
                    total,
                    currency
                },
                metadata: {
                    confidence,
                    pages: 1
                },
                rawText: text
            };
        }
        catch (error) {
            console.error('Error processing image:', error);
            throw new Error('Failed to process image');
        }
    }
    extractText(document) {
        return document.text || '';
    }
    extractEntities(document) {
        if (!document.entities || !document.entities.length) {
            return [];
        }
        return document.entities.map((entity) => ({
            type: entity.type || 'unknown',
            mentionText: entity.mentionText || '',
            confidence: entity.confidence || 0,
            value: entity.textAnchor && document.text &&
                entity.textAnchor.textSegments &&
                entity.textAnchor.textSegments[0] &&
                typeof entity.textAnchor.textSegments[0].startIndex === 'number' &&
                typeof entity.textAnchor.textSegments[0].endIndex === 'number'
                ? document.text.substring(entity.textAnchor.textSegments[0].startIndex, entity.textAnchor.textSegments[0].endIndex)
                : null
        }));
    }
    extractProductsAndPrices(text) {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const results = [];
        console.log("Analyzing OCR text lines:");
        console.log(lines);
        const isTabularFormat = lines.length >= 3 &&
            (lines[0].toLowerCase().includes('cantidad') ||
                lines[0].toLowerCase().includes('cant') ||
                lines[1].toLowerCase().includes('concepto') ||
                lines[1].toLowerCase().includes('product'));
        if (isTabularFormat) {
            console.log("Detected tabular format with column headers");
            const startIndex = lines.findIndex(line => line.toLowerCase().includes('total') ||
                line.toLowerCase().includes('precio')) + 1;
            for (let i = startIndex; i < lines.length; i += 3) {
                if (i + 2 < lines.length) {
                    const quantityStr = lines[i].trim();
                    const product = lines[i + 1].trim();
                    const priceStr = lines[i + 2].trim();
                    if (/^\d+$/.test(quantityStr) && /^\d+$/.test(priceStr)) {
                        const quantity = parseInt(quantityStr);
                        const price = parseInt(priceStr);
                        results.push({
                            product,
                            quantity,
                            price
                        });
                        console.log(`Extracted from tabular format: ${product}, qty: ${quantity}, price: ${price}`);
                    }
                }
            }
        }
        else {
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                console.log(`Processing line: "${line}"`);
                if (line.length < 2 || /^\d+$/.test(line)) {
                    console.log("Skipping index line");
                    continue;
                }
                const pattern1 = /^(.+?)\s+(\d+)$/;
                let match = line.match(pattern1);
                if (match) {
                    const product = match[1].trim();
                    const price = parseInt(match[2]);
                    let quantity = 1;
                    if (i > 0 && /^\d+$/.test(lines[i - 1].trim())) {
                        const prevLine = lines[i - 1].trim();
                        const potentialQty = parseInt(prevLine);
                        if (potentialQty > 0 && potentialQty < 100) {
                            quantity = potentialQty;
                            console.log(`Found quantity ${quantity} in previous line for product ${product}`);
                        }
                    }
                    results.push({
                        product,
                        quantity,
                        price
                    });
                    console.log(`Extracted from pattern 1: ${product}, qty: ${quantity}, price: ${price}`);
                    continue;
                }
            }
            if (results.length === 0) {
                console.log("No standard patterns found, trying alternative approach");
                for (let i = 0; i < lines.length - 2; i++) {
                    const qtyLine = lines[i].trim();
                    const productLine = lines[i + 1].trim();
                    const priceLine = lines[i + 2].trim();
                    if (/^\d+$/.test(qtyLine) && qtyLine.length < 3) {
                        const quantity = parseInt(qtyLine);
                        if (/^\d+$/.test(priceLine) && parseInt(priceLine) > 100) {
                            const price = parseInt(priceLine);
                            const product = productLine;
                            results.push({
                                product,
                                quantity,
                                price
                            });
                            console.log(`Extracted from triplet pattern: ${product}, qty: ${quantity}, price: ${price}`);
                            i += 2;
                        }
                    }
                }
            }
        }
        console.log(`Total items extracted: ${results.length}`);
        return results;
    }
    formatOcrResults(text, document) {
        var _a;
        const items = this.extractProductsAndPrices(text);
        const itemsWithSubtotals = items.map(item => ({
            name: item.product,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        }));
        const total = itemsWithSubtotals.reduce((sum, item) => sum + item.subtotal, 0);
        const pages = ((_a = document.pages) === null || _a === void 0 ? void 0 : _a.map((page) => {
            var _a, _b;
            return ({
                width: ((_a = page.dimension) === null || _a === void 0 ? void 0 : _a.width) || 0,
                height: ((_b = page.dimension) === null || _b === void 0 ? void 0 : _b.height) || 0,
                pageNumber: page.pageNumber || 1
            });
        })) || [];
        let textConfidence = 0;
        if (document.textChanges && document.textChanges.length > 0) {
            textConfidence = 0.95;
        }
        return {
            receipt: {
                items: itemsWithSubtotals,
                total: total,
                currency: 'COP',
                date: new Date().toISOString(),
                merchant: this.extractMerchantInfo(text)
            },
            metadata: {
                confidence: textConfidence,
                pages: pages,
                processing: {
                    processor: process.env.GOOGLE_PROCESSOR_ID,
                    timestamp: new Date().toISOString()
                }
            },
            rawText: text
        };
    }
    extractMerchantInfo(text) {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const merchantName = lines.length > 0 ? lines[0].trim() : 'Unknown';
        return {
            name: merchantName,
        };
    }
    extractItems(text) {
        const lines = text.split('\n');
        const items = [];
        const pattern = /^(\d+)\s+(.+?)\s+(\d+\.?\d*)$/;
        for (const line of lines) {
            const match = line.match(pattern);
            if (match) {
                items.push({
                    quantity: parseInt(match[1]),
                    name: match[2].trim(),
                    price: parseFloat(match[3])
                });
            }
        }
        return items;
    }
    extractTotal(text) {
        const lines = text.split('\n');
        const totalPattern = /total:?\s*(\d+\.?\d*)/i;
        for (const line of lines) {
            const match = line.match(totalPattern);
            if (match) {
                return parseFloat(match[1]);
            }
        }
        return 0;
    }
    extractCurrency(text) {
        const currencyPattern = /(\$|€|£|COP)/;
        const match = text.match(currencyPattern);
        return match ? match[1] : '$';
    }
}
exports.OcrService = OcrService;
//# sourceMappingURL=ocr.service.js.map