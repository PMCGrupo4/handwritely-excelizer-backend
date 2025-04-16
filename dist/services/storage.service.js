"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const supabase_1 = require("../config/supabase");
const uuid_1 = require("uuid");
class StorageService {
    async uploadImage(buffer, userId) {
        try {
            const filename = `${userId}/${(0, uuid_1.v4)()}.jpg`;
            const blob = new Blob([buffer], { type: 'image/jpeg' });
            const { data, error } = await supabase_1.supabase.storage
                .from('receipt-images')
                .upload(filename, blob, {
                contentType: 'image/jpeg',
                upsert: false,
            });
            if (error)
                throw error;
            const { data: { publicUrl } } = supabase_1.supabase.storage
                .from('receipt-images')
                .getPublicUrl(filename);
            return publicUrl;
        }
        catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Failed to upload image');
        }
    }
    async deleteImage(url) {
        try {
            const path = url.split('/').slice(-2).join('/');
            const { error } = await supabase_1.supabase.storage
                .from('receipt-images')
                .remove([path]);
            if (error)
                throw error;
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