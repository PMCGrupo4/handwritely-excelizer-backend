import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { OcrService } from '../services/ocr.service';
import formidable from 'formidable';
import * as fs from 'fs';

const ocrService = new OcrService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const form = formidable();
    const [, files] = await form.parse(event.body || '');
    
    if (!files.image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No image provided' })
      };
    }

    const file = files.image[0];
    const imageBuffer = fs.readFileSync(file.filepath);
    const result = await ocrService.processImage(imageBuffer);

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error processing image:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process image' })
    };
  }
}; 