import { supabase } from './supabase';

interface Bucket {
  name: string;
}

/**
 * Initialize Supabase Storage bucket for receipt images
 */
export async function initializeStorage() {
  try {
    console.log('Inicializando almacenamiento...');
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      console.log('Continuando sin inicializar el bucket...');
      return;
    }
    
    const bucketExists = buckets?.some((bucket: Bucket) => bucket.name === 'receipt-images') || false;
    
    if (!bucketExists) {
      console.log('Bucket "receipt-images" no encontrado. Intentando crear...');
      
      // Create bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket('receipt-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg']
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
        console.log('Continuando sin crear el bucket. Es posible que necesites crearlo manualmente en el panel de Supabase.');
        return;
      }
      console.log('Created receipt-images bucket');
    } else {
      console.log('Bucket "receipt-images" ya existe.');
    }
    
    // Set up bucket policies
    try {
      const { error: policyError } = await supabase.rpc('create_storage_policy', {
        bucket_name: 'receipt-images',
        policy_name: 'Users can upload their own images',
        policy_definition: '(auth.uid() = owner)',
        policy_operation: 'INSERT'
      });
      
      if (policyError) {
        console.error('Error setting up storage policy:', policyError);
        console.log('Continuando sin configurar la política. Es posible que necesites configurarla manualmente en el panel de Supabase.');
      } else {
        console.log('Storage policy configured successfully');
      }
    } catch (policyError) {
      console.error('Error setting up storage policy:', policyError);
      console.log('Continuando sin configurar la política. Es posible que necesites configurarla manualmente en el panel de Supabase.');
    }
    
    console.log('Storage initialization completed');
  } catch (error) {
    console.error('Error initializing storage:', error);
    console.log('Continuando sin inicializar el almacenamiento...');
  }
} 