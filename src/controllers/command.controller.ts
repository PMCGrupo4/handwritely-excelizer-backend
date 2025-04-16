import { Request, Response } from 'express';
import { CommandService } from '../services/command.service';
import { OcrResult } from '../services/ocr.service';

export class CommandController {
  private commandService: CommandService;

  constructor() {
    this.commandService = new CommandService();
  }

  async createCommand(req: Request, res: Response): Promise<Response> {
    try {
      const ocrResult: OcrResult = req.body;
      const command = await this.commandService.createCommand(ocrResult);
      return res.status(201).json(command);
    } catch (error) {
      console.error('Error creating command:', error);
      return res.status(500).json({ error: 'Failed to create command' });
    }
  }

  async getCommand(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const command = await this.commandService.getCommand(id);
      if (!command) {
        return res.status(404).json({ error: 'Command not found' });
      }
      return res.json(command);
    } catch (error) {
      console.error('Error getting command:', error);
      return res.status(500).json({ error: 'Failed to get command' });
    }
  }

  async deleteCommand(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await this.commandService.deleteCommand(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting command:', error);
      return res.status(500).json({ error: 'Failed to delete command' });
    }
  }
} 