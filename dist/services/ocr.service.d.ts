import { protos } from '@google-cloud/documentai';
type Document = protos.google.cloud.documentai.v1.IDocument;
export declare class OcrService {
    private projectId;
    private location;
    private processorId;
    private client;
    constructor();
    processImage(imageBuffer: Buffer): Promise<Document>;
    extractText(document: Document): string;
    extractEntities(document: Document): Array<{
        type: string;
        mentionText: string;
        confidence: number;
        value: string | null;
    }>;
    extractProductsAndPrices(text: string): Array<{
        product: string;
        quantity: number;
        price: number;
    }>;
    formatOcrResults(text: string, document: Document): {
        receipt: {
            items: {
                name: string;
                price: number;
                quantity: number;
                subtotal: number;
            }[];
            total: number;
            currency: string;
            date: string;
            merchant: {
                name: string;
            };
        };
        metadata: {
            confidence: number;
            pages: {
                width: number;
                height: number;
                pageNumber: number;
            }[];
            processing: {
                processor: string | undefined;
                timestamp: string;
            };
        };
        rawText: string;
    };
    private extractMerchantInfo;
}
export {};
