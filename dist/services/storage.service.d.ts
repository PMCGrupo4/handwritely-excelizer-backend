export interface StorageConfig {
    bucketName: string;
    projectId: string;
}
export interface StorageResult {
    url: string;
    path: string;
    bucket: string;
    filename: string;
}
/**
 * Storage Service using Google Cloud Storage
 */
export declare class StorageService {
    private storage;
    private bucketName;
    constructor(config: StorageConfig);
    /**
     * Upload a file to Google Cloud Storage
     */
    uploadFile(filePath: string, destination: string): Promise<StorageResult>;
    /**
     * Delete a file from Google Cloud Storage
     */
    deleteFile(filePath: string): Promise<void>;
}
