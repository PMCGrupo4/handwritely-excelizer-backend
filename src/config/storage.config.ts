import { supabase } from './supabase';

/**
 * Initialize Supabase Storage bucket for receipt images
 */
export async function initializeStorage() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) throw listError;
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'receipt-images') || false;
    
    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { data, error } = await supabase.storage.createBucket('receipt-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg']
      });
      
      if (error) throw error;
      console.log('Created receipt-images bucket');
    }
    
    // Set up bucket policies
    const { error: policyError } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'receipt-images',
      policy_name: 'Users can upload their own images',
      policy_definition: '(auth.uid() = owner)',
      policy_operation: 'INSERT'
    });
    
    if (policyError) {
      console.error('Error setting up storage policy:', policyError);
    }
    
    console.log('Storage initialized successfully');
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw error;
  }
} 