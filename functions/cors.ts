import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  console.log('CORS handler called:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers,
    origin: event.headers.origin || event.headers.Origin
  });

  // Set CORS headers for response
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'text/plain',
    'Content-Length': '0'
  };

  return {
    statusCode: 204, // No content is expected in a preflight response
    headers,
    body: ''
  };
}; 