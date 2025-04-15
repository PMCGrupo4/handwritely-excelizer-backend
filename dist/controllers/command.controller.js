"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandController = void 0;
const uuid_1 = require("uuid");
const supabase_config_1 = require("../config/supabase.config");
const storage_service_1 = require("../services/storage.service");
const ocr_service_1 = require("../services/ocr.service");
const ocrService = new ocr_service_1.OcrService();
class CommandController {
    constructor() {
        this.storageService = new storage_service_1.StorageService({
            bucketName: process.env.GOOGLE_STORAGE_BUCKET || '',
            projectId: process.env.GOOGLE_PROJECT_ID || ''
        });
    }
    /**
     * Get all commands for a user
     */
    async getUserCommands(req, res) {
        try {
            const userId = req.user.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const { data, error } = await supabase_config_1.supabase
                .from('commands')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            return res.json(data);
        }
        catch (error) {
            console.error('Error fetching commands:', error);
            return res.status(500).json({ error: 'Failed to fetch commands' });
        }
    }
    /**
     * Create a new command from an image
     */
    async createCommand(req, res) {
        var _a, _b, _c, _d;
        try {
            const userId = req.user.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided' });
            }
            // Generate a unique ID for the command
            const commandId = (0, uuid_1.v4)();
            // Upload the image to Supabase Storage
            const fileExtension = req.file.originalname.split('.').pop();
            const filePath = `${userId}/${commandId}.${fileExtension}`;
            // Convert Buffer to Blob for Supabase
            const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
            const { data: uploadData, error: uploadError } = await supabase_config_1.supabase.storage
                .from('receipt-images')
                .upload(filePath, blob, {
                contentType: req.file.mimetype,
                upsert: false
            });
            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            // Get the public URL of the uploaded image
            const { data: { publicUrl } } = supabase_config_1.supabase.storage
                .from('receipt-images')
                .getPublicUrl(filePath);
            // Process the image with OCR
            const document = await ocrService.processImage(req.file.buffer);
            const text = ocrService.extractText(document);
            const ocrResult = ocrService.formatOcrResults(text, document);
            // Save the command to the database
            const { data: commandData, error: commandError } = await supabase_config_1.supabase
                .from('commands')
                .insert({
                id: commandId,
                user_id: userId,
                image_url: publicUrl,
                items: ((_a = ocrResult.receipt) === null || _a === void 0 ? void 0 : _a.items) || [],
                total: ((_b = ocrResult.receipt) === null || _b === void 0 ? void 0 : _b.total) || 0,
                status: 'completed'
            });
            if (commandError) {
                console.error('Error saving command:', commandError);
                return res.status(500).json({ error: 'Failed to save command' });
            }
            // Return the command data
            res.status(201).json({
                id: commandId,
                image_url: publicUrl,
                items: ((_c = ocrResult.receipt) === null || _c === void 0 ? void 0 : _c.items) || [],
                total: ((_d = ocrResult.receipt) === null || _d === void 0 ? void 0 : _d.total) || 0,
                status: 'completed'
            });
        }
        catch (error) {
            console.error('Error creating command:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    /**
     * Delete a command
     */
    async deleteCommand(req, res) {
        try {
            const userId = req.user.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const commandId = req.params.id;
            if (!commandId) {
                return res.status(400).json({ error: 'Command ID is required' });
            }
            // Get the command to check if it belongs to the user
            const { data: command, error: fetchError } = await supabase_config_1.supabase
                .from('commands')
                .select('image_url')
                .eq('id', commandId)
                .single();
            if (fetchError || !command) {
                return res.status(404).json({ error: 'Command not found' });
            }
            // Delete the command from the database
            const { error: deleteError } = await supabase_config_1.supabase
                .from('commands')
                .delete()
                .eq('id', commandId);
            if (deleteError) {
                console.error('Error deleting command:', deleteError);
                return res.status(500).json({ error: 'Failed to delete command' });
            }
            // Delete the image from storage if it exists
            if (command.image_url) {
                const filePath = command.image_url.split('/').pop();
                if (filePath) {
                    const { error: storageError } = await supabase_config_1.supabase.storage
                        .from('receipt-images')
                        .remove([`${userId}/${filePath}`]);
                    if (storageError) {
                        console.error('Error deleting image:', storageError);
                    }
                }
            }
            // Return success
            res.status(200).json({ message: 'Command deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting command:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    /**
     * Process an image with OCR
     */
    async processImageOcr(req, res) {
        try {
            // Eliminamos la verificación de userId ya que esta ruta es pública para pruebas
            if (!req.file || !req.file.buffer) {
                return res.status(400).json({ error: 'No image provided' });
            }
            // Process the image with Document AI
            const document = await ocrService.processImage(req.file.buffer);
            // Extract text and do formatting
            const text = ocrService.extractText(document);
            const formattedResults = ocrService.formatOcrResults(text, document);
            // Add success flag and demo user information
            return res.json({
                success: true,
                data: {
                    ...formattedResults,
                    userId: 'demo-user' // Usamos un usuario demo fijo
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