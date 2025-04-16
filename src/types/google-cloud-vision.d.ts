declare module '@google-cloud/vision' {
  export class ImageAnnotatorClient {
    constructor(options?: { credentials?: any });
    textDetection(request: { image: { content?: string; source?: { imageUri?: string } } }): Promise<[any]>;
    documentTextDetection(request: { image: { content?: string; source?: { imageUri?: string } } }): Promise<[any]>;
  }
} 