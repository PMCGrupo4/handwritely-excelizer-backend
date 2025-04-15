import { ImageAnnotatorClient } from '@google-cloud/vision';
import path from 'path';

// Crea un cliente de Vision API
const client = new ImageAnnotatorClient({
  keyFilename: path.join(__dirname, '../../credentials/google-cloud.json'),
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