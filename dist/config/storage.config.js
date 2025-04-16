"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeStorage = initializeStorage;
const supabase_1 = require("./supabase");
async function initializeStorage() {
    try {
        console.log('Inicializando almacenamiento...');
        const { data: buckets, error: listError } = await supabase_1.supabase.storage.listBuckets();
        if (listError) {
            console.error('Error listing buckets:', listError);
            console.log('Continuando sin inicializar el bucket...');
            return;
        }
        const bucketExists = (buckets === null || buckets === void 0 ? void 0 : buckets.some((bucket) => bucket.name === 'receipt-images')) || false;
        if (!bucketExists) {
            console.log('Bucket "receipt-images" no encontrado. Intentando crear...');
            const { error } = await supabase_1.supabase.storage.createBucket('receipt-images', {
                public: true,
                fileSizeLimit: 5242880,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg']
            });
            if (error) {
                console.error('Error creating bucket:', error);
                console.log('Continuando sin crear el bucket. Es posible que necesites crearlo manualmente en el panel de Supabase.');
                return;
            }
            console.log('Created receipt-images bucket');
        }
        else {
            console.log('Bucket "receipt-images" ya existe.');
        }
        try {
            const { error: policyError } = await supabase_1.supabase.rpc('create_storage_policy', {
                bucket_name: 'receipt-images',
                policy_name: 'Users can upload their own images',
                policy_definition: '(auth.uid() = owner)',
                policy_operation: 'INSERT'
            });
            if (policyError) {
                console.error('Error setting up storage policy:', policyError);
                console.log('Continuando sin configurar la política. Es posible que necesites configurarla manualmente en el panel de Supabase.');
            }
            else {
                console.log('Storage policy configured successfully');
            }
        }
        catch (policyError) {
            console.error('Error setting up storage policy:', policyError);
            console.log('Continuando sin configurar la política. Es posible que necesites configurarla manualmente en el panel de Supabase.');
        }
        console.log('Storage initialization completed');
    }
    catch (error) {
        console.error('Error initializing storage:', error);
        console.log('Continuando sin inicializar el almacenamiento...');
    }
}
//# sourceMappingURL=storage.config.js.map