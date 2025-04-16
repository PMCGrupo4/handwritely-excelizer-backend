export declare class StorageService {
    uploadImage(buffer: Buffer, userId: string): Promise<string>;
    deleteImage(url: string): Promise<boolean>;
}
