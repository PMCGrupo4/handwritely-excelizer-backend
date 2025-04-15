"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeStorage = initializeStorage;
const supabase_1 = require("./supabase");
/**
 * Initialize Supabase Storage bucket for receipt images
 */
async function initializeStorage() {
    try {
        // Check if bucket exists
        const { data: buckets, error: listError } = await supabase_1.supabase.storage.listBuckets();
        if (listError) {
            console.error('Error listing buckets:', listError);
            return;
        }
        const bucketExists = (buckets === null || buckets === void 0 ? void 0 : buckets.some((bucket) => bucket.name === 'receipt-images')) || false;
        if (!bucketExists) {
            // Create bucket if it doesn't exist
            const { error } = await supabase_1.supabase.storage.createBucket('receipt-images', {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg']
            });
            if (error) {
                console.error('Error creating bucket:', error);
                return;
            }
            console.log('Created receipt-images bucket');
        }
        // Set up bucket policies
        const { error: policyError } = await supabase_1.supabase.rpc('create_storage_policy', {
            bucket_name: 'receipt-images',
            policy_name: 'Users can upload their own images',
            policy_definition: '(auth.uid() = owner)',
            policy_operation: 'INSERT'
        });
        if (policyError) {
            console.error('Error setting up storage policy:', policyError);
            // Continue execution even if policy setup fails
        }
        console.log('Storage initialized successfully');
    }
    catch (error) {
        console.error('Error initializing storage:', error);
        // Don't throw the error, just log it
    }
}
//# sourceMappingURL=storage.config.js.map