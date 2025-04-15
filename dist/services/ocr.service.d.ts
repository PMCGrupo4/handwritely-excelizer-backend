import { protos } from '@google-cloud/documentai';
type Document = protos.google.cloud.documentai.v1.IDocument;
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
/**
 * OCR Service using Google Document AI
 */
export declare class OcrService {
    private projectId;
    private location;
    private processorId;
    private client;
    constructor();
    /**
     * Process an image using Google Document AI
     * @param {Buffer} imageBuffer - The image buffer to process
     * @returns {Promise<Document>} The processed document with text and structure information
     */
    processImage(imageBuffer: Buffer): Promise<Document>;
    /**
     * Extract text from a processed document
     * @param {Document} document - The processed document
     * @returns {string} The extracted text
     */
    extractText(document: Document): string;
    /**
     * Extract entities (key-value pairs) from a processed document
     * @param {Document} document - The processed document
     * @returns {Array<Object>} Array of extracted entities
     */
    extractEntities(document: Document): Array<{
        type: string;
        mentionText: string;
        confidence: number;
        value: string | null;
    }>;
    /**
     * Extract products and prices from OCR text
     * @param {string} text - The extracted text from OCR
     * @returns {Array<{product: string, quantity: number, price: number}>} Array of products, quantities and prices
     */
    extractProductsAndPrices(text: string): Array<{
        product: string;
        quantity: number;
        price: number;
    }>;
    /**
     * Format OCR results into a standardized structure
     * @param {string} text - The raw text from OCR
     * @param {Document} document - The original document
     * @returns {object} Formatted OCR results
     */
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
                width: any;
                height: any;
                pageNumber: any;
            }[];
            processing: {
                processor: string | undefined;
                timestamp: string;
            };
        };
        rawText: string;
    };
    /**
     * Attempt to extract merchant information
     * @param {string} text - The raw text from OCR
     * @returns {object} Merchant information
     */
    private extractMerchantInfo;
}
export {};
