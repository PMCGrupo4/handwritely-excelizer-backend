import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';
import * as XLSX from 'xlsx';
import { supabase } from './supabase';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  // Log request information for debugging
  console.log('OCR function received request:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers,
    origin: event.headers.origin || event.headers.Origin,
    referer: event.headers.referer || event.headers.Referer
  });
  
  // Obtener el origen de la solicitud o usar el origen del frontend por defecto
  const origin = event.headers.origin || event.headers.Origin || 'https://handsheet.netlify.app';
  
  // Definir los encabezados CORS con el origen específico
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true'
  };
  
  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('OCR: Handling OPTIONS request directly in OCR function');
    return {
      statusCode: 204, // No content for OPTIONS
      headers: corsHeaders,
      body: ''
    };
  }

  // Verificar que sea una petición POST
  if (event.httpMethod !== 'POST') {
    console.log(`OCR: Method ${event.httpMethod} not allowed`);
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    console.log('Received request:', {
      headers: event.headers,
      bodyLength: event.body ? event.body.length : 0,
      hasBody: !!event.body
    });

    // Obtener la imagen del cuerpo de la petición
    if (!event.body) {
      console.log('OCR: No request body provided');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'No request body provided' })
      };
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (error) {
      console.error('OCR: Error parsing JSON body:', error);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const imageBase64 = body.image;
    const userId = body.userId;

    if (!imageBase64) {
      console.log('OCR: No image provided in request body');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'No image provided' })
      };
    }

    if (!userId) {
      console.log('OCR: No userId provided in request body');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'No userId provided' })
      };
    }

    console.log('Processing image with Google Document AI...');
    
    // Convertir base64 a buffer
    let imageDataParts = imageBase64.split(',');
    const imageBuffer = Buffer.from(
      imageDataParts.length > 1 ? imageDataParts[1] : imageBase64, 
      'base64'
    );

    // Inicializar Google Document AI client
    let credentials;
    try {
      credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');
    } catch (error) {
      console.error('Error parsing GOOGLE_CLOUD_CREDENTIALS:', error);
      throw new Error('Invalid GOOGLE_CLOUD_CREDENTIALS format');
    }

    const client = new DocumentProcessorServiceClient({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const projectId = process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GOOGLE_PROCESSOR_LOCATION || 'us';
    const processorId = process.env.GOOGLE_PROCESSOR_ID;

    if (!projectId || !processorId) {
      throw new Error('Google Document AI configuration is missing');
    }

    // Construct the processor name
    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    // Create the request
    const request = {
      name,
      rawDocument: {
        content: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg',
      }
    };

    // Process the document
    const [result] = await client.processDocument(request);
    const { document } = result;

    if (!document) {
      throw new Error('Document processing returned empty result');
    }

    const text = document.text || '';
    console.log('OCR completed successfully');

    // Procesamiento de los datos de OCR
    const items = extractProductsAndPrices(text);
    
    // Calcular subtotales
    const itemsWithSubtotals = items.map(item => ({
      name: item.product,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }));
    
    const total = itemsWithSubtotals.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Obtener datos de páginas y dimensiones si están disponibles
    const pages = document.pages?.map(page => ({
      width: page.dimension?.width || 0,
      height: page.dimension?.height || 0,
      pageNumber: page.pageNumber || 1
    })) || [];
    
    // Formato de respuesta
    const formattedResults = {
      receipt: {
        items: itemsWithSubtotals,
        total: total,
        currency: 'COP',
        date: new Date().toISOString(),
        merchant: {
          name: extractMerchantInfo(text)
        }
      },
      metadata: {
        confidence: 0.95,
        pages: pages,
        processing: {
          processor: processorId,
          timestamp: new Date().toISOString()
        }
      },
      rawText: text,
      user_id: userId
    };

    // Convertir el texto a formato Excel para compatibilidad con versión anterior
    console.log('Converting to Excel...');
    const workbook = XLSX.utils.book_new();
    
    // Crear hoja para texto completo
    const textWorksheet = XLSX.utils.aoa_to_sheet([['Texto Extraído'], [text]]);
    XLSX.utils.book_append_sheet(workbook, textWorksheet, 'Texto');
    
    // Crear hoja para productos
    const productsHeaders = ['Producto', 'Cantidad', 'Precio', 'Subtotal'];
    const productsData = [
      productsHeaders,
      ...itemsWithSubtotals.map(item => [
        item.name,
        item.quantity.toString(),
        item.price.toString(),
        item.subtotal.toString()
      ])
    ];
    const productsWorksheet = XLSX.utils.aoa_to_sheet(productsData);
    XLSX.utils.book_append_sheet(workbook, productsWorksheet, 'Productos');

    // Generar el archivo Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const excelBase64 = excelBuffer.toString('base64');

    // Guardar en Supabase
    let saveResult: { saved: boolean; id?: any; error?: string } = { saved: false };
    try {
      console.log('Saving to Supabase...');
      const { data, error } = await supabase
        .from('ocr_results')
        .insert([
          { 
            text,
            excel_file: excelBase64,
            user_id: userId,
            formatted_data: formattedResults
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error saving to Supabase:', error);
        saveResult = { saved: false, error: error.message };
      } else {
        saveResult = { saved: true, id: data.id };
      }
    } catch (supabaseError: any) {
      console.error('Exception saving to Supabase:', supabaseError);
      saveResult = { saved: false, error: supabaseError.message };
    }

    console.log('OCR request completed successfully');
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true, 
        data: formattedResults,
        saveResult
      })
    };

  } catch (error: any) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

// Función auxiliar para extraer productos y precios del texto OCR
function extractProductsAndPrices(text: string): Array<{product: string, quantity: number, price: number}> {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const results: Array<{product: string, quantity: number, price: number}> = [];
  
  console.log("Analyzing OCR text lines:");
  
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
        }
      }
    }
  } else {
    // Try standard patterns first
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip very short lines that might be just numbers (like indices)
      if (line.length < 2 || /^\d+$/.test(line)) {
        continue;
      }
      
      // Pattern 1: Product name followed by price
      const pattern1 = /^(.+?)\s+(\d+)$/;
      
      // Pattern 2: Quantity followed by product name followed by price
      const pattern2 = /^(\d+)\s+(.+?)\s+(\d+)$/;
      
      // Pattern 3: Quantity x Product Price
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
          
          // Only use as quantity if it's a reasonable number
          if (potentialQty > 0 && potentialQty < 100) {
            quantity = potentialQty;
          }
        }
        
        results.push({
          product,
          quantity,
          price
        });
        
        continue;
      }
      
      match = line.match(pattern2);
      if (match) {
        const quantity = parseInt(match[1]);
        const product = match[2].trim();
        const price = parseInt(match[3]);
        
        results.push({
          product,
          quantity,
          price
        });
        
        continue;
      }
      
      match = line.match(pattern3);
      if (match) {
        const quantity = parseInt(match[1]);
        const product = match[2].trim();
        const price = parseInt(match[3]);
        
        results.push({
          product,
          quantity,
          price
        });
      }
    }
    
    // If we haven't matched anything yet, try multiline approach
    if (results.length === 0) {
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
            
            // Skip the next two lines since we processed them
            i += 2;
          }
        }
      }
    }
  }
  
  return results;
}

// Función auxiliar para extraer información del comerciante
function extractMerchantInfo(text: string): string {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  // Often the merchant name is at the top of the receipt
  const merchantName = lines.length > 0 ? lines[0].trim() : 'Unknown';
  
  return merchantName;
} 