import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import dotenv from 'dotenv';

dotenv.config();

export const handler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Get environment information (without sensitive data)
  const envInfo = {
    nodeEnv: process.env.NODE_ENV || 'development',
    googleProjectId: process.env.GOOGLE_PROJECT_ID ? 'configured' : 'not configured',
    googleProcessorId: process.env.GOOGLE_PROCESSOR_ID ? 'configured' : 'not configured',
    supabaseUrl: process.env.SUPABASE_URL ? 'configured' : 'not configured',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY ? 'configured' : 'not configured',
    googleCloudCredentials: process.env.GOOGLE_CLOUD_CREDENTIALS ? 'configured' : 'not configured',
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: envInfo,
      message: 'Handwritely Excelizer Backend is running',
    }),
  };
}; 