import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  console.log('CORS handler called:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers,
    origin: event.headers.origin || event.headers.Origin
  });

  // Obtener el origen de la solicitud o usar el origen del frontend por defecto
  const origin = event.headers.origin || event.headers.Origin || 'https://handsheet.netlify.app';

  // Set CORS headers for response
  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Para solicitudes OPTIONS, siempre devolver 204 No Content
  if (event.httpMethod === 'OPTIONS') {
    console.log('Respondiendo a solicitud OPTIONS con 204');
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Para otras solicitudes, redirigir a la función correspondiente
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'CORS preflight response completed' })
  };
}; 