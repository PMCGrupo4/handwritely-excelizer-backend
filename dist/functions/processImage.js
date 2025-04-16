"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const googleVision_1 = require("../services/googleVision");
const visionService = new googleVision_1.GoogleVisionService();
const handler = async (event) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No image data provided' })
            };
        }
        const imageBuffer = Buffer.from(event.body, 'base64');
        const text = await visionService.detectText(imageBuffer);
        const handwriting = await visionService.detectHandwriting(imageBuffer);
        return {
            statusCode: 200,
            body: JSON.stringify({
                text,
                handwriting
            })
        };
    }
    catch (error) {
        console.error('Error processing image:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to process image' })
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=processImage.js.map