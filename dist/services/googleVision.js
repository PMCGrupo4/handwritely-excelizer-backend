"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectText = detectText;
exports.detectHandwriting = detectHandwriting;
const vision_1 = require("@google-cloud/vision");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Parse the credentials from environment variable
let credentials;
try {
    credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}');
}
catch (error) {
    console.error('Error parsing GOOGLE_CLOUD_CREDENTIALS:', error);
    throw new Error('Invalid GOOGLE_CLOUD_CREDENTIALS format');
}
// Create Vision API client with credentials
const client = new vision_1.ImageAnnotatorClient({
    credentials
});
async function detectText(imageBuffer) {
    try {
        const base64Image = imageBuffer.toString('base64');
        const [result] = await client.textDetection({
            image: { content: base64Image }
        });
        const detections = result.textAnnotations;
        if (!detections || detections.length === 0) {
            throw new Error('No text detected in the image');
        }
        // El primer elemento contiene todo el texto detectado
        return detections[0].description || '';
    }
    catch (error) {
        console.error('Error detecting text:', error);
        throw error;
    }
}
async function detectHandwriting(imageBuffer) {
    try {
        const base64Image = imageBuffer.toString('base64');
        const [result] = await client.documentTextDetection({
            image: { content: base64Image }
        });
        const detections = result.fullTextAnnotation;
        if (!detections) {
            throw new Error('No handwriting detected in the image');
        }
        return detections.text || '';
    }
    catch (error) {
        console.error('Error detecting handwriting:', error);
        throw error;
    }
}
//# sourceMappingURL=googleVision.js.map