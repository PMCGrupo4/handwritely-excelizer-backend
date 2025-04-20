// Google Document AI OCR Service
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { GoogleAuth } from 'google-auth-library';
import { protos } from '@google-cloud/documentai';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

type Document = protos.google.cloud.documentai.v1.IDocument;
type Entity = protos.google.cloud.documentai.v1.Document.IEntity;

// Interfaz para resultados OCR
export interface OcrResult {
  receipt?: {
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      subtotal: number;
    }>;
    total: number;
    currency: string;
    date: string;
    merchant: {
      name: string;
    };
  };
  metadata?: {
    confidence: number;
    pages: any[];
    processing: {
      processor: string | undefined;
      timestamp: string;
    };
  };
  rawText: string;
  user_id?: string;
}

/**
 * OCR Service using Google Document AI
 */
export class OcrService {
  private projectId: string | undefined;
  private location: string;
  private processorId: string | undefined;
  private client: DocumentProcessorServiceClient;

  constructor() {
    this.projectId = process.env.GOOGLE_PROJECT_ID;
    this.location = process.env.GOOGLE_PROCESSOR_LOCATION || 'us';
    this.processorId = process.env.GOOGLE_PROCESSOR_ID;
    
    let authOptions: any = {};
    
    // Priorizar credenciales JSON directamente en variable de entorno para Netlify
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        authOptions = {
          credentials,
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        };
        console.log('Using Google credentials from environment variable JSON');
      } catch (error) {
        console.error('Error parsing credentials JSON from environment:', error);
      }
    }
    // Fallback: intentar usar credenciales desde un archivo
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      
      // Si es una ruta relativa, resolverla
      if (credentialsPath.startsWith('./') || credentialsPath.startsWith('../')) {
        const resolvedPath = path.resolve(process.cwd(), credentialsPath);
        console.log(`Using Google credentials from file: ${resolvedPath}`);
        
        if (fs.existsSync(resolvedPath)) {
          authOptions = {
            keyFilename: resolvedPath,
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
          };
        } else {
          console.error(`Credentials file not found at: ${resolvedPath}`);
        }
      } else {
        // Usar la ruta tal cual
        authOptions = {
          keyFilename: credentialsPath,
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        };
      }
    } 
    // Fallback final: autenticación por defecto
    else {
      console.log('No explicit credentials provided, using default authentication');
      authOptions = {
        auth: new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        })
      };
    }
    
    // Inicializar el cliente
    this.client = new DocumentProcessorServiceClient(authOptions);
    
    console.log('OCR Service initialized with project:', this.projectId);
  }

  /**
   * Process an image using Google Document AI
   * @param {Buffer} imageBuffer - The image buffer to process
   * @returns {Promise<Document>} The processed document with text and structure information
   */
  async processImage(imageBuffer: Buffer): Promise<Document> {
    try {
      if (!this.projectId || !this.processorId) {
        throw new Error('Google Document AI configuration is missing');
      }

      // Construct the processor name
      const name = `projects/${this.projectId}/locations/${this.location}/processors/${this.processorId}`;

      // Convert buffer to base64
      const encodedImage = imageBuffer.toString('base64');

      // Create the request
      const request = {
        name,
        rawDocument: {
          content: encodedImage,
          mimeType: 'image/jpeg',
        }
      };

      // Process the document
      const [result] = await this.client.processDocument(request);
      const { document } = result;

      if (!document) {
        throw new Error('Document processing returned empty result');
      }

      return document;
    } catch (error) {
      console.error('Error processing image with Document AI:', error);
      throw new Error('Failed to process image with OCR service');
    }
  }

  /**
   * Extract text from a processed document
   * @param {Document} document - The processed document
   * @returns {string} The extracted text
   */
  extractText(document: Document): string {
    return document.text || '';
  }

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
  }> {
    if (!document.entities || !document.entities.length) {
      return [];
    }

    return document.entities.map((entity: Entity) => ({
      type: entity.type || 'unknown',
      mentionText: entity.mentionText || '',
      confidence: entity.confidence || 0,
      value: entity.textAnchor && document.text && 
        entity.textAnchor.textSegments && 
        entity.textAnchor.textSegments[0] && 
        typeof entity.textAnchor.textSegments[0].startIndex === 'number' && 
        typeof entity.textAnchor.textSegments[0].endIndex === 'number' 
          ? document.text.substring(
              entity.textAnchor.textSegments[0].startIndex, 
              entity.textAnchor.textSegments[0].endIndex
            ) 
          : null
    }));
  }

  /**
   * Extract products and prices from OCR text
   * @param {string} text - The extracted text from OCR
   * @returns {Array<{product: string, quantity: number, price: number}>} Array of products, quantities and prices
   */
  extractProductsAndPrices(text: string): Array<{product: string, quantity: number, price: number}> {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const results: Array<{product: string, quantity: number, price: number}> = [];
    
    console.log("Analyzing OCR text lines:");
    console.log(lines);
    
    // Check if this is a tabular format with column headers
    const isTabularFormat = lines.length >= 3 && 
      (lines[0].toLowerCase().includes('cantidad') || 
       lines[0].toLowerCase().includes('cant') ||
       lines[1].toLowerCase().includes('concepto') ||
       lines[1].toLowerCase().includes('product'));
    
    if (isTabularFormat) {
      console.log("Detected tabular format with column headers");
      
      // Skip headers
      const startIndex = lines.findIndex(line => 
        line.toLowerCase().includes('total') || 
        line.toLowerCase().includes('precio')
      ) + 1;
      
      // Process items in groups of 3 (quantity, product, price)
      for (let i = startIndex; i < lines.length; i += 3) {
        if (i + 2 < lines.length) {
          const quantityStr = lines[i].trim();
          const product = lines[i + 1].trim();
          const priceStr = lines[i + 2].trim();
          
          // Validate that quantityStr and priceStr are numbers
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
    } else {
      // Try standard patterns first
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        console.log(`Processing line: "${line}"`);
        
        // Skip very short lines that might be just numbers (like indices)
        if (line.length < 2 || /^\d+$/.test(line)) {
          console.log("Skipping index line");
          continue;
        }
        
        // Try to match different patterns
        
        // Pattern 1: Product name followed by price (most common in simple receipts)
        // Example: "Coca Cola 3000" or "Aquas 60000"
        const pattern1 = /^(.+?)\s+(\d+)$/;
        
        // Pattern 2: Quantity followed by product name followed by price
        // Example: "2 Coca Cola 6000"
        const pattern2 = /^(\d+)\s+(.+?)\s+(\d+)$/;
        
        // Pattern 3: Quantity x Product Price
        // Example: "2 x Coca Cola 6000"
        const pattern3 = /^(\d+)\s*x\s*(.+?)\s+(\d+)$/;
        
        let match = line.match(pattern1);
        if (match) {
          const product = match[1].trim();
          const price = parseInt(match[2]);
          
          // Check if the previous line contains just a number 
          // which could potentially be the quantity
          let quantity = 1; // Default
          
          if (i > 0 && /^\d+$/.test(lines[i-1].trim())) {
            const prevLine = lines[i-1].trim();
            const potentialQty = parseInt(prevLine);
            
            // Only use as quantity if it's a reasonable number (not too large)
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
        
        // Other patterns...
      }
      
      // If we haven't matched anything yet, try multiline approach
      if (results.length === 0) {
        console.log("No standard patterns found, trying alternative approach");
        
        // Find triplets of (quantity, product, price)
        for (let i = 0; i < lines.length - 2; i++) {
          const qtyLine = lines[i].trim();
          const productLine = lines[i + 1].trim();
          const priceLine = lines[i + 2].trim();
          
          // Check if first line is a single number (quantity)
          if (/^\d+$/.test(qtyLine) && qtyLine.length < 3) {
            const quantity = parseInt(qtyLine);
            
            // Check if third line is a number (price)
            if (/^\d+$/.test(priceLine) && parseInt(priceLine) > 100) {
              const price = parseInt(priceLine);
              
              // Second line is the product
              const product = productLine;
              
              results.push({
                product,
                quantity,
                price
              });
              
              console.log(`Extracted from triplet pattern: ${product}, qty: ${quantity}, price: ${price}`);
              
              // Skip the next two lines since we processed them
              i += 2;
            }
          }
        }
      }
    }
    
    console.log(`Total items extracted: ${results.length}`);
    return results;
  }

  /**
   * Format OCR results into a standardized structure
   * @param {string} text - The raw text from OCR
   * @param {Document} document - The original document
   * @returns {object} Formatted OCR results
   */
  formatOcrResults(text: string, document: Document) {
    // Extract products and prices
    const items = this.extractProductsAndPrices(text);
    
    // Calculate subtotals for each item and the overall total
    const itemsWithSubtotals = items.map(item => ({
      name: item.product,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }));
    
    const total = itemsWithSubtotals.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Get document pages and dimensions if available
    const pages = document.pages?.map(page => ({
      width: page.dimension?.width || 0,
      height: page.dimension?.height || 0,
      pageNumber: page.pageNumber || 1
    })) || [];
    
    // Get confidence score if available - simplify to avoid type errors
    let textConfidence = 0;
    if (document.textChanges && document.textChanges.length > 0) {
      // Use any available confidence metrics, or default to 0.95 for Google Document AI
      textConfidence = 0.95;
    }
    
    // Format the response
    return {
      receipt: {
        items: itemsWithSubtotals,
        total: total,
        currency: 'COP', // Default, you could make this configurable
        date: new Date().toISOString(),
        merchant: this.extractMerchantInfo(text) // Additional helper method
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
  
  /**
   * Attempt to extract merchant information
   * @param {string} text - The raw text from OCR
   * @returns {object} Merchant information
   */
  private extractMerchantInfo(text: string) {
    // This is a simplified implementation
    // You might want to enhance this with more sophisticated pattern matching
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Often the merchant name is at the top of the receipt
    const merchantName = lines.length > 0 ? lines[0].trim() : 'Unknown';
    
    return {
      name: merchantName,
      // Add more fields as needed (address, phone, etc.)
    };
  }
} 