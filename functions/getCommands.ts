import { Handler, HandlerEvent } from '@netlify/functions';
import { supabase } from './supabase';

export const handler: Handler = async (event: HandlerEvent) => {
  // Log request information for debugging
  console.log('getCommands function received request:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers,
    origin: event.headers.origin || event.headers.Origin
  });
  
  // Obtener el origen de la solicitud o usar el origen del frontend por defecto
  const origin = event.headers.origin || event.headers.Origin || 'https://handsheet.netlify.app';
  
  // Definir los encabezados CORS con el origen específico
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true'
  };
  
  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('getCommands: Handling OPTIONS request');
    return {
      statusCode: 204, // No content for OPTIONS
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // También permitir GET para facilitar las pruebas
    if (event.httpMethod === 'GET') {
      console.log('Processing GET request (test mode)');
      
      // Simplemente devolver algunas comandas de prueba
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: true, 
          data: [
            {
              id: '1234',
              user_id: 'test-user',
              created_at: new Date().toISOString(),
              formatted_data: {
                receipt: {
                  items: [
                    { name: 'Producto 1', price: 1000, quantity: 2, subtotal: 2000 }
                  ],
                  total: 2000
                }
              }
            }
          ]
        })
      };
    }
    
    // POST para obtener comandas por userId
    if (event.httpMethod === 'POST') {
      console.log('Processing POST request to get commands by userId');
      
      // Obtener userId del cuerpo
      if (!event.body) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'No request body provided' })
        };
      }

      let body;
      try {
        body = JSON.parse(event.body);
      } catch (error) {
        console.error('Error parsing JSON body:', error);
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Invalid JSON in request body' })
        };
      }

      const userId = body.userId;

      if (!userId) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'userId is required' })
        };
      }

      console.log(`Fetching commands for user: ${userId}`);
      console.log('Supabase URL:', process.env.SUPABASE_URL);
      
      try {
        // Consultar la tabla ocr_results para este usuario
        const { data, error } = await supabase
          .from('ocr_results')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching commands from Supabase:', error);
          return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
              error: 'Error fetching commands', 
              details: error.message,
              code: error.code
            })
          };
        }

        console.log(`Found ${data?.length || 0} commands for user ${userId}`);
        
        return {
          statusCode: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            success: true, 
            data: data || []
          })
        };
      } catch (supabaseError: any) {
        console.error('Exception during Supabase query:', supabaseError);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ 
            error: 'Supabase query error', 
            details: supabaseError.message,
            stack: process.env.NODE_ENV === 'development' ? supabaseError.stack : undefined
          })
        };
      }
    }
    
    // Si no es GET ni POST, retornar error
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error: any) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
}; 