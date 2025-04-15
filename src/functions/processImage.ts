import { Handler } from '@netlify/functions';
import { detectText, detectHandwriting } from '../services/googleVision';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { image, type = 'text' } = JSON.parse(event.body || '{}');

    if (!image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No image provided' }),
      };
    }

    // Convertir la imagen base64 a Buffer
    const imageBuffer = Buffer.from(image.split(',')[1], 'base64');

    // Procesar la imagen según el tipo
    const result = type === 'handwriting' 
      ? await detectHandwriting(imageBuffer)
      : await detectText(imageBuffer);

    return {
      statusCode: 200,
      body: JSON.stringify({ text: result }),
    };
  } catch (error) {
    console.error('Error processing image:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error processing image' }),
    };
  }
}; 