"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const supabase_1 = require("../config/supabase");
const uuid_1 = require("uuid");
class StorageService {
    constructor(config) {
        this.bucketName = (config === null || config === void 0 ? void 0 : config.bucketName) || 'receipt-images';
        this.checkBucketExists();
    }
    async checkBucketExists() {
        try {
            const { data: buckets, error } = await supabase_1.supabase.storage.listBuckets();
            if (error) {
                console.error('Error checking bucket existence:', error);
                return false;
            }
            const bucketExists = buckets.some((bucket) => bucket.name === this.bucketName);
            if (!bucketExists) {
                console.warn(`Bucket '${this.bucketName}' does not exist. Please create it in the Supabase dashboard.`);
            }
            else {
                console.log(`Bucket '${this.bucketName}' encontrado.`);
            }
            return bucketExists;
        }
        catch (error) {
            console.error('Error checking bucket existence:', error);
            return false;
        }
    }
    async uploadImage(file) {
        try {
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${(0, uuid_1.v4)()}.${fileExtension}`;
            const filePath = `${fileName}`;
            const blob = new Blob([file.buffer], { type: file.mimetype });
            const { error } = await supabase_1.supabase.storage
                .from(this.bucketName)
                .upload(filePath, blob, {
                contentType: file.mimetype,
                upsert: false
            });
            if (error) {
                throw error;
            }
            const { data: { publicUrl } } = supabase_1.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);
            return publicUrl;
        }
        catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }
    async deleteImage(imageUrl) {
        try {
            const filePath = imageUrl.split('/').pop();
            if (!filePath) {
                throw new Error('Invalid image URL');
            }
            const { error } = await supabase_1.supabase.storage
                .from(this.bucketName)
                .remove([filePath]);
            if (error) {
                throw error;
            }
            return true;
        }
        catch (error) {
            console.error('Error deleting image:', error);
            return false;
        }
    }
}
exports.StorageService = StorageService;
//# sourceMappingURL=storage.service.js.map