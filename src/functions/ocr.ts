import { Handler } from '@netlify/functions';
import formidable from 'formidable';
import { createWorker } from 'tesseract.js';
import * as XLSX from 'xlsx';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const form = formidable();
    const [fields, files] = await form.parse(event.body || '');
    
    if (!files.file || files.file.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No file provided' }),
      };
    }

    const file = files.file[0];
    const worker = await createWorker();
    
    // Perform OCR on the image
    const { data: { text } } = await worker.recognize(file.filepath);
    await worker.terminate();

    // Convert text to Excel format
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([text.split('\n')]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OCR Result');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=ocr-result.xlsx',
      },
      body: excelBuffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Error processing file:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}; 