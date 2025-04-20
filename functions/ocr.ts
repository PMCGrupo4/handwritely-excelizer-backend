import { Handler } from '@netlify/functions';
import { createWorker } from 'tesseract.js';
import * as XLSX from 'xlsx';
import { supabase } from './supabase';
import { AppError } from './shared/error';

export const handler: Handler = async (event) => {
  // Verificar que sea una petición POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Obtener la imagen del cuerpo de la petición
    const body = JSON.parse(event.body || '{}');
    const imageBase64 = body.image;

    if (!imageBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No se proporcionó ninguna imagen' })
      };
    }

    // Convertir base64 a buffer
    const imageBuffer = Buffer.from(imageBase64.split(',')[1], 'base64');

    // Inicializar worker de Tesseract
    const worker = await createWorker();
    await worker.reinitialize('spa');
    
    // Procesar la imagen
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();

    // Convertir el texto a formato Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([['Texto Extraído'], [text]]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Texto');

    // Generar el archivo Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const excelBase64 = excelBuffer.toString('base64');

    // Guardar en Supabase
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
      console.error('Error al guardar en Supabase:', error as AppError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error al guardar los resultados' })
      };
    }

    if (!data) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No se pudo obtener el ID del resultado' })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        excelBase64,
        id: data.id
      })
    };
  } catch (error) {
    console.error('Error al procesar la imagen:', error as AppError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al procesar la imagen' })
    };
  }
}; 