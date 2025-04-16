import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export function getGoogleCloudCredentials() {
  try {
    // 1. Primero intenta leer desde la variable de entorno (para producción/despliegue)
    if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
      return JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
    }

    // 2. Si no está en la variable de entorno, intenta leer desde el archivo (para desarrollo local)
    const credentialsPath = path.join(process.cwd(), 'credentials', 'google-cloud-credentials.json');
    if (fs.existsSync(credentialsPath)) {
      return JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    }

    // 3. Si estamos en producción y no hay credenciales, lanzar error
    if (process.env.NODE_ENV === 'production') {
      throw new Error('No se encontraron las credenciales de Google Cloud en producción');
    }

    // 4. En desarrollo, usar credenciales de ejemplo si no hay otras disponibles
    console.warn('⚠️ Usando credenciales de ejemplo para desarrollo. No usar en producción.');
    return {
      type: "service_account",
      project_id: "your-project-id",
      private_key_id: "your-private-key-id",
      private_key: "your-private-key",
      client_email: "your-client-email",
      client_id: "your-client-id",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: "your-cert-url"
    };
  } catch (error) {
    console.error('Error al cargar las credenciales de Google Cloud:', error);
    throw error;
  }
} 