import { OcrResult } from './ocr.service';
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
export declare class CommandService {
    createCommand(ocrResult: OcrResult): Promise<Command>;
    getCommand(id: string): Promise<Command | null>;
    deleteCommand(id: string): Promise<void>;
}
