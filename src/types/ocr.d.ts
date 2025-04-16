declare module '../services/ocr.service' {
  export interface OcrResult {
    receipt?: {
      items: Array<{
        name: string;
        price: number;
        quantity: number;
        subtotal: number;
      }>;
      total: number;
      currency: string;
      date: string;
      merchant: {
        name: string;
      };
    };
    metadata: {
      confidence: number;
      pages: Array<{
        width: number;
        height: number;
        pageNumber: number;
      }>;
      processing: {
        processor: string;
        timestamp: string;
      };
    };
    rawText: string;
  }

  export class OcrService {
    constructor();
    processImage(imageBuffer: Buffer): Promise<OcrResult>;
    extractText(document: any): string;
    formatOcrResults(text: string, document: any): OcrResult;
  }
} 