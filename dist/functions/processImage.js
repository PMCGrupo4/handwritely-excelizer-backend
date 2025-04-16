"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const googleVision_1 = require("../services/googleVision");
const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
    try {
        const { image, type = 'text' } = JSON.parse(event.body || '{}');
        if (!image) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No image provided' }),
            };
        }
        const imageBuffer = Buffer.from(image.split(',')[1], 'base64');
        const result = type === 'handwriting'
            ? await (0, googleVision_1.detectHandwriting)(imageBuffer)
            : await (0, googleVision_1.detectText)(imageBuffer);
        return {
            statusCode: 200,
            body: JSON.stringify({ text: result }),
        };
    }
    catch (error) {
        console.error('Error processing image:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error processing image' }),
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=processImage.js.map