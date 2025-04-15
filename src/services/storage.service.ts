import { supabase } from '../config/supabase.config';
import { v4 as uuidv4 } from 'uuid';

interface Bucket {
  name: string;
  id: string;
  owner: string;
  created_at: string;
  updated_at: string;
  public: boolean;
}

interface StorageConfig {
  bucketName?: string;
  projectId?: string;
}

export class StorageService {
  private bucketName: string;

  constructor(config?: StorageConfig) {
    this.bucketName = config?.bucketName || 'receipt-images';
    this.checkBucketExists();
  }

  /**
   * Verifica si el bucket existe y lo crea si es necesario
   */
  private async checkBucketExists() {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error checking bucket existence:', error);
        return;
      }
      
      const bucketExists = buckets?.some((bucket: Bucket) => bucket.name === this.bucketName);
      
      if (!bucketExists) {
        console.warn(`Bucket '${this.bucketName}' no encontrado. Asegúrate de que el bucket existe en Supabase.`);
        console.warn('Puedes crear el bucket manualmente en el panel de Supabase o ejecutar el script SQL en docs/supabase-setup.sql');
      } else {
        console.log(`Bucket '${this.bucketName}' encontrado.`);
      }
    } catch (error) {
      console.error('Error checking bucket existence:', error);
    }
  }

  /**
   * Upload an image to Supabase Storage
   * @param buffer The image buffer
   * @param userId The user ID
   * @returns The public URL of the uploaded image
   */
  async uploadImage(buffer: Buffer, userId: string): Promise<string> {
    try {
      // Generate a unique filename
      const filename = `${userId}/${uuidv4()}.jpg`;
      
      // Convert Buffer to Blob
      const blob = new Blob([buffer], { type: 'image/jpeg' });
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filename);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Delete an image from Supabase Storage
   * @param url The public URL of the image
   * @returns True if successful
   */
  async deleteImage(url: string): Promise<boolean> {
    try {
      // Extract the path from the URL
      const path = url.split('/').slice(-2).join('/');
      
      // Delete the file from Supabase Storage
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path]);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }
} 