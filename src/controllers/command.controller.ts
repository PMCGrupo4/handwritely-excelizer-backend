import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { StorageService } from '../services/storage.service';
import { OcrService } from '../services/ocr.service';
import Tesseract from 'tesseract.js';

interface CommandItem {
  product: string;
  quantity: number;
  price: number;
}

interface CommandTableRow {
  product: string;
  quantity: number;
  price: number;
  total: number;
}

export class CommandController {
  private storageService: StorageService;
  private ocrService: OcrService;

  constructor() {
    this.storageService = new StorageService();
    this.ocrService = new OcrService();
  }

  /**
   * Get all commands for a user
   */
  async getUserCommands(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { data, error } = await supabase
        .from('commands')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.json(data);
    } catch (error) {
      console.error('Error getting user commands:', error);
      return res.status(500).json({ error: 'Failed to get commands' });
    }
  }

  /**
   * Create a new command from an image
   */
  async createCommand(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Upload image to Supabase Storage
      const imageUrl = await this.storageService.uploadImage(req.file.buffer, userId);

      // Process image with Tesseract OCR
      const { data: { text } } = await Tesseract.recognize(
        req.file.buffer,
        'eng',
        { logger: m => console.log(m) }
      );

      // Parse the OCR text into command items
      const items = this.parseCommandText(text);

      // Calculate totals
      const rows: CommandTableRow[] = items.map(item => ({
        ...item,
        total: item.quantity * item.price
      }));

      const total = rows.reduce((sum, row) => sum + row.total, 0);

      // Save command to Supabase
      const { data, error } = await supabase
        .from('commands')
        .insert({
          user_id: userId,
          image_url: imageUrl,
          items: rows,
          total,
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(data);
    } catch (error) {
      console.error('Error creating command:', error);
      return res.status(500).json({ error: 'Failed to create command' });
    }
  }

  /**
   * Delete a command
   */
  async deleteCommand(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;

      // Check if command exists and belongs to user
      const { data: command, error: fetchError } = await supabase
        .from('commands')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (!command) {
        return res.status(404).json({ error: 'Command not found' });
      }

      if (command.user_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this command' });
      }

      // Delete image from storage if it exists
      if (command.image_url) {
        await this.storageService.deleteImage(command.image_url);
      }

      // Delete command from database
      const { error: deleteError } = await supabase
        .from('commands')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting command:', error);
      return res.status(500).json({ error: 'Failed to delete command' });
    }
  }

  /**
   * Parse OCR text into command items
   */
  private parseCommandText(text: string): CommandItem[] {
    // This is a simplified parser - you would need to implement more sophisticated
    // parsing logic based on your specific receipt format
    const lines = text.split('\n').filter(line => line.trim());
    const items: CommandItem[] = [];

    for (const line of lines) {
      // Simple regex to extract product, quantity, and price
      // This is just an example and would need to be adapted to your specific format
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

  /**
   * Process an image with OCR
   */
  async processImageOcr(req: Request, res: Response) {
    try {
      // Eliminamos la verificación de userId ya que esta ruta es pública para pruebas
      
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: 'No image provided' });
      }

      // Process the image with Document AI
      const document = await this.ocrService.processImage(req.file.buffer);
      
      // Extract text and do formatting
      const text = this.ocrService.extractText(document);
      const formattedResults = this.ocrService.formatOcrResults(text, document);
      
      // Add success flag and demo user information
      return res.json({
        success: true,
        data: {
          ...formattedResults,
          userId: 'demo-user' // Usamos un usuario demo fijo
        }
      });
    } catch (error) {
      console.error('Error processing image with OCR:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to process image with OCR',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 