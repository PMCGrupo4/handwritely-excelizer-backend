import { ImageAnnotatorClient } from '@google-cloud/vision';
import dotenv from 'dotenv';

dotenv.config();

export class GoogleVisionService {
  private client: ImageAnnotatorClient;

  constructor() {
    this.client = new ImageAnnotatorClient();
  }

  async detectText(imageBuffer: Buffer): Promise<string> {
    try {
      const [result] = await this.client.textDetection({
        image: { content: imageBuffer.toString('base64') }
      });
      const detections = result.textAnnotations;
      
      if (!detections || detections.length === 0) {
        return '';
      }

      return detections[0].description || '';
    } catch (error) {
      console.error('Error detecting text:', error);
      throw new Error('Failed to detect text in image');
    }
  }

  async detectHandwriting(imageBuffer: Buffer): Promise<string> {
    try {
      const [result] = await this.client.documentTextDetection({
        image: { content: imageBuffer.toString('base64') }
      });
      const detections = result.fullTextAnnotation;
      
      if (!detections) {
        return '';
      }

      return detections.text || '';
    } catch (error) {
      console.error('Error detecting handwriting:', error);
      throw new Error('Failed to detect handwriting in image');
    }
  }
} 