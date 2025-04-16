import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GoogleVisionService } from '../services/googleVision';

const visionService = new GoogleVisionService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No image data provided' })
      };
    }

    const imageBuffer = Buffer.from(event.body, 'base64');
    const text = await visionService.detectText(imageBuffer);
    const handwriting = await visionService.detectHandwriting(imageBuffer);

    return {
      statusCode: 200,
      body: JSON.stringify({
        text,
        handwriting
      })
    };
  } catch (error) {
    console.error('Error processing image:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process image' })
    };
  }
}; 