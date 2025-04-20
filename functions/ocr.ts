import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';
import { createWorker } from 'tesseract.js';
import * as XLSX from 'xlsx';
import { supabase } from './supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json'
};

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  // Log request information for debugging
  console.log('OCR function received request:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers,
    origin: event.headers.origin || event.headers.Origin,
    referer: event.headers.referer || event.headers.Referer
  });
  
  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('OCR: Handling OPTIONS request for CORS preflight');
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
      body: event.body ? 'Body present' : 'No body'
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

    if (!imageBase64) {
      console.log('OCR: No image provided in request body');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'No image provided' })
      };
    }

    console.log('Processing image...');
    
    // Convertir base64 a buffer
    const imageBuffer = Buffer.from(imageBase64.split(',')[1], 'base64');

    // Inicializar worker de Tesseract
    console.log('Initializing Tesseract worker...');
    const worker = await createWorker();
    await worker.reinitialize('spa');
    
    // Procesar la imagen
    console.log('Processing image with Tesseract...');
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();
    console.log('OCR completed successfully');

    // Convertir el texto a formato Excel
    console.log('Converting to Excel...');
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([['Texto Extraído'], [text]]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Texto');

    // Generar el archivo Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const excelBase64 = excelBuffer.toString('base64');

    // Guardar en Supabase
    console.log('Saving to Supabase...');
    const { data, error } = await supabase
      .from('ocr_results')
      .insert([
        { 
          text,
          excel_file: excelBase64,
          user_id: body.userId
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving to Supabase:', error);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Error saving results' })
      };
    }

    console.log('OCR request completed successfully');
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data })
    };

  } catch (error: any) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
}; 