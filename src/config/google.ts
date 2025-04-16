import dotenv from 'dotenv';

dotenv.config();

export const googleCloudCredentials = {
  projectId: process.env.GOOGLE_PROJECT_ID,
  location: process.env.GOOGLE_LOCATION || 'us',
  processorId: process.env.GOOGLE_PROCESSOR_ID
};

// Obtener el string JSON de la variable de entorno
const credentialsString = process.env.GOOGLE_CLOUD_CREDENTIALS;

if (credentialsString) {
  try {
    // Parsear el string JSON a un objeto
    JSON.parse(credentialsString);
    console.log("Google Cloud credentials loaded successfully.");
    // Aquí puedes inicializar tu cliente de Google Cloud usando el objeto 'googleCloudCredentialsParsed'
    // Ejemplo: const vision = new Vision({ credentials: googleCloudCredentialsParsed });
  } catch (error) {
    console.error("Error parsing GOOGLE_CLOUD_CREDENTIALS JSON:", error);
    // Decide cómo manejar el error: ¿detener el servidor, usar un default, etc.?
  }
} else {
  console.error("GOOGLE_CLOUD_CREDENTIALS environment variable is not set!");
  // Decide cómo manejar la ausencia de credenciales
}

// Ahora puedes usar la variable 'googleCloudCredentialsParsed' donde la necesites,
// asegurándote de que no sea null antes de usarla.
// Ejemplo: if (googleCloudCredentialsParsed) { /* usa credentials.project_id, etc. */ }