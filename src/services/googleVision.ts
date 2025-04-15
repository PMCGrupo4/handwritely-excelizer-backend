import { ImageAnnotatorClient } from '@google-cloud/vision';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Parse the credentials from environment variable
let credentials;
try {
  credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}');
} catch (error) {
  console.error('Error parsing GOOGLE_CLOUD_CREDENTIALS:', error);
  throw new Error('Invalid GOOGLE_CLOUD_CREDENTIALS format');
}

// Create Vision API client with credentials
const client = new ImageAnnotatorClient({
  credentials
});

export async function detectText(imageBuffer: Buffer): Promise<string> {
  try {
    const [result] = await client.textDetection({
      image: { content: imageBuffer },
    });

    const detections = result.textAnnotations;
    if (!detections || detections.length === 0) {
      throw new Error('No text detected in the image');
    }

    // El primer elemento contiene todo el texto detectado
    return detections[0].description || '';
  } catch (error) {
    console.error('Error detecting text:', error);
    throw error;
  }
}

export async function detectHandwriting(imageBuffer: Buffer): Promise<string> {
  try {
    const [result] = await client.documentTextDetection({
      image: { content: imageBuffer },
    });

    const detections = result.fullTextAnnotation;
    if (!detections) {
      throw new Error('No handwriting detected in the image');
    }

    return detections.text || '';
  } catch (error) {
    console.error('Error detecting handwriting:', error);
    throw error;
  }
} 