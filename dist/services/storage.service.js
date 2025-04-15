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
exports.StorageService = void 0;
const storage_1 = require("@google-cloud/storage");
const path = __importStar(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Storage Service using Google Cloud Storage
 */
class StorageService {
    constructor(config) {
        this.storage = new storage_1.Storage({
            projectId: config.projectId,
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        });
        this.bucketName = config.bucketName;
    }
    /**
     * Upload a file to Google Cloud Storage
     */
    async uploadFile(filePath, destination) {
        try {
            await this.storage.bucket(this.bucketName).upload(filePath, {
                destination,
                metadata: {
                    contentType: 'application/pdf',
                },
            });
            const [url] = await this.storage
                .bucket(this.bucketName)
                .file(destination)
                .getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            });
            return {
                url,
                path: destination,
                bucket: this.bucketName,
                filename: path.basename(destination),
            };
        }
        catch (error) {
            console.error('Error uploading file:', error);
            throw new Error('Failed to upload file to storage');
        }
    }
    /**
     * Delete a file from Google Cloud Storage
     */
    async deleteFile(filePath) {
        try {
            await this.storage.bucket(this.bucketName).file(filePath).delete();
        }
        catch (error) {
            console.error('Error deleting file:', error);
            throw new Error('Failed to delete file from storage');
        }
    }
}
exports.StorageService = StorageService;
//# sourceMappingURL=storage.service.js.map