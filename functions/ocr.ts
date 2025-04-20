import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';
import { createWorker } from 'tesseract.js';
import * as XLSX from 'xlsx';
import { supabase } from './supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json',
  'Vary': 'Origin'
};

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  // Manejar preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  // Verificar que sea una petición POST
  if (event.httpMethod !== 'POST') {
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
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'No request body provided' })
      };
    }

    const body = JSON.parse(event.body);
    const imageBase64 = body.image;

    if (!imageBase64) {
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

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data })
    };

  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}; 