"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeStorage = initializeStorage;
const supabase_1 = require("./supabase");
async function initializeStorage() {
    try {
        const { data: buckets, error: listError } = await supabase_1.supabase.storage.listBuckets();
        if (listError)
            throw listError;
        const bucketExists = (buckets === null || buckets === void 0 ? void 0 : buckets.some((bucket) => bucket.name === 'receipt-images')) || false;
        if (!bucketExists) {
            const { data, error } = await supabase_1.supabase.storage.createBucket('receipt-images', {
                public: true,
                fileSizeLimit: 5242880,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg']
            });
            if (error)
                throw error;
            console.log('Created receipt-images bucket');
        }
        const { error: policyError } = await supabase_1.supabase.rpc('create_storage_policy', {
            bucket_name: 'receipt-images',
            policy_name: 'Users can upload their own images',
            policy_definition: '(auth.uid() = owner)',
            policy_operation: 'INSERT'
        });
        if (policyError) {
            console.error('Error setting up storage policy:', policyError);
        }
        console.log('Storage initialized successfully');
    }
    catch (error) {
        console.error('Error initializing storage:', error);
        throw error;
    }
}
//# sourceMappingURL=storage.config.js.map