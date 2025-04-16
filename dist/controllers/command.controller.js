"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandController = void 0;
const supabase_1 = require("../config/supabase");
const storage_service_1 = require("../services/storage.service");
const ocr_service_1 = require("../services/ocr.service");
const tesseract_js_1 = __importDefault(require("tesseract.js"));
class CommandController {
    constructor() {
        this.storageService = new storage_service_1.StorageService();
        this.ocrService = new ocr_service_1.OcrService();
    }
    async getUserCommands(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { data, error } = await supabase_1.supabase
                .from('commands')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            return res.json(data);
        }
        catch (error) {
            console.error('Error getting user commands:', error);
            return res.status(500).json({ error: 'Failed to get commands' });
        }
    }
    async createCommand(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided' });
            }
            const imageUrl = await this.storageService.uploadImage(req.file.buffer, userId);
            const { data: { text } } = await tesseract_js_1.default.recognize(req.file.buffer, 'eng', { logger: m => console.log(m) });
            const items = this.parseCommandText(text);
            const rows = items.map(item => ({
                ...item,
                total: item.quantity * item.price
            }));
            const total = rows.reduce((sum, row) => sum + row.total, 0);
            const { data: insertData, error: insertError } = await supabase_1.supabase
                .from('commands')
                .insert({
                user_id: userId,
                image_url: imageUrl,
                items: rows,
                total,
                status: 'completed'
            });
            if (insertError)
                throw insertError;
            const { data, error } = await supabase_1.supabase
                .from('commands')
                .select('*')
                .eq('id', insertData[0].id)
                .single();
            if (error)
                throw error;
            return res.status(201).json(data);
        }
        catch (error) {
            console.error('Error creating command:', error);
            return res.status(500).json({ error: 'Failed to create command' });
        }
    }
    async deleteCommand(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { id } = req.params;
            const { data: command, error: fetchError } = await supabase_1.supabase
                .from('commands')
                .select('*')
                .eq('id', id)
                .single();
            if (fetchError)
                throw fetchError;
            if (!command) {
                return res.status(404).json({ error: 'Command not found' });
            }
            if (command.user_id !== userId) {
                return res.status(403).json({ error: 'Not authorized to delete this command' });
            }
            if (command.image_url) {
                await this.storageService.deleteImage(command.image_url);
            }
            const { error: deleteError } = await supabase_1.supabase
                .from('commands')
                .delete()
                .eq('id', id);
            if (deleteError)
                throw deleteError;
            return res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting command:', error);
            return res.status(500).json({ error: 'Failed to delete command' });
        }
    }
    parseCommandText(text) {
        const lines = text.split('\n').filter(line => line.trim());
        const items = [];
        for (const line of lines) {
            const match = line.match(/(.+?)\s+(\d+)\s+(\d+\.\d+)/);
            if (match) {
                items.push({
                    product: match[1].trim(),
                    quantity: parseInt(match[2]),
                    price: parseFloat(match[3])
                });
            }
        }
        return items;
    }
    async processImageOcr(req, res) {
        try {
            if (!req.file || !req.file.buffer) {
                return res.status(400).json({ error: 'No image provided' });
            }
            const document = await this.ocrService.processImage(req.file.buffer);
            const text = this.ocrService.extractText(document);
            const formattedResults = this.ocrService.formatOcrResults(text, document);
            return res.json({
                success: true,
                data: {
                    ...formattedResults,
                    userId: 'demo-user'
                }
            });
        }
        catch (error) {
            console.error('Error processing image with OCR:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to process image with OCR',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.CommandController = CommandController;
//# sourceMappingURL=command.controller.js.map