"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const handler = async (event) => {
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
exports.handler = handler;
//# sourceMappingURL=health.js.map