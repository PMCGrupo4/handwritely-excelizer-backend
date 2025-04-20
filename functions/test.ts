import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
  
  // Log all information for debugging
  console.log({
    method: event.httpMethod,
    path: event.path,
    headers: event.headers,
    body: event.body
  });

  // Handle OPTIONS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Handle regular requests
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ 
      message: 'Test endpoint working', 
      method: event.httpMethod,
      timestamp: new Date().toISOString()
    })
  };
}; 