"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleVisionService = void 0;
const vision_1 = require("@google-cloud/vision");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class GoogleVisionService {
    constructor() {
        this.client = new vision_1.ImageAnnotatorClient();
    }
    async detectText(imageBuffer) {
        try {
            const [result] = await this.client.textDetection({
                image: { content: imageBuffer.toString('base64') }
            });
            const detections = result.textAnnotations;
            if (!detections || detections.length === 0) {
                return '';
            }
            return detections[0].description || '';
        }
        catch (error) {
            console.error('Error detecting text:', error);
            throw new Error('Failed to detect text in image');
        }
    }
    async detectHandwriting(imageBuffer) {
        try {
            const [result] = await this.client.documentTextDetection({
                image: { content: imageBuffer.toString('base64') }
            });
            const detections = result.fullTextAnnotation;
            if (!detections) {
                return '';
            }
            return detections.text || '';
        }
        catch (error) {
            console.error('Error detecting handwriting:', error);
            throw new Error('Failed to detect handwriting in image');
        }
    }
}
exports.GoogleVisionService = GoogleVisionService;
//# sourceMappingURL=googleVision.js.map