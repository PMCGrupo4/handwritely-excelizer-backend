"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Asegúrate de cargar las variables de entorno
// Variable para almacenar las credenciales parseadas
let googleCloudCredentials = null;
// Obtener el string JSON de la variable de entorno
const credentialsString = process.env.GOOGLE_CLOUD_CREDENTIALS;
if (credentialsString) {
    try {
        // Parsear el string JSON a un objeto
        googleCloudCredentials = JSON.parse(credentialsString);
        console.log("Google Cloud credentials loaded successfully.");
        // Aquí puedes inicializar tu cliente de Google Cloud usando el objeto 'googleCloudCredentials'
        // Ejemplo: const vision = new Vision({ credentials: googleCloudCredentials });
    }
    catch (error) {
        console.error("Error parsing GOOGLE_CLOUD_CREDENTIALS JSON:", error);
        // Decide cómo manejar el error: ¿detener el servidor, usar un default, etc.?
    }
}
else {
    console.error("GOOGLE_CLOUD_CREDENTIALS environment variable is not set!");
    // Decide cómo manejar la ausencia de credenciales
}
// Ahora puedes usar la variable 'googleCloudCredentials' donde la necesites,
// asegurándote de que no sea null antes de usarla.
// Ejemplo: if (googleCloudCredentials) { /* usa credentials.project_id, etc. */ }s
//# sourceMappingURL=google.js.map