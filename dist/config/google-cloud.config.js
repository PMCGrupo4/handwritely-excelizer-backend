"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoogleCloudCredentials = getGoogleCloudCredentials;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getGoogleCloudCredentials() {
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
    }
    catch (error) {
        console.error('Error al cargar las credenciales de Google Cloud:', error);
        throw error;
    }
}
//# sourceMappingURL=google-cloud.config.js.map