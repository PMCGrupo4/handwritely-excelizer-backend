import { supabase } from '../config/supabase';
import { OcrResult } from './ocr.service';
import { v4 as uuidv4 } from 'uuid';

export interface Command {
  id: string;
  user_id: string;
  image_url: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export class CommandService {
  async createCommand(ocrResult: OcrResult): Promise<Command> {
    const commandId = uuidv4();
    const userId = (ocrResult as any).user_id;

    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('commands')
      .insert({
        id: commandId,
        user_id: userId,
        items: ocrResult.receipt?.items || [],
        total: ocrResult.receipt?.total || 0,
        status: 'completed'
      })
      .then(({ error: insertError }) => {
        if (insertError) throw insertError;
        return supabase
          .from('commands')
          .select('*')
          .eq('id', commandId)
          .single();
      });

    if (error) {
      throw new Error(`Failed to create command: ${error.message}`);
    }

    return data;
  }

  async getCommand(id: string): Promise<Command | null> {
    const { data, error } = await supabase
      .from('commands')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get command: ${error.message}`);
    }

    return data;
  }

  async deleteCommand(id: string): Promise<void> {
    const { error } = await supabase
      .from('commands')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete command: ${error.message}`);
    }
  }
} 