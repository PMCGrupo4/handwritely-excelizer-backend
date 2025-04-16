import { supabase } from '../config/supabase';
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
  private async checkBucketExists(): Promise<boolean> {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error checking bucket existence:', error);
        return false;
      }
      
      const bucketExists = buckets.some((bucket: Bucket) => bucket.name === this.bucketName);
      
      if (!bucketExists) {
        console.warn(`Bucket '${this.bucketName}' does not exist. Please create it in the Supabase dashboard.`);
      } else {
        console.log(`Bucket '${this.bucketName}' encontrado.`);
      }

      return bucketExists;
    } catch (error) {
      console.error('Error checking bucket existence:', error);
      return false;
    }
  }

  /**
   * Upload an image to Supabase Storage
   * @param file The image file
   * @returns The public URL of the uploaded image
   */
  async uploadImage(file: { buffer: Buffer; originalname: string; mimetype: string }): Promise<string> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `${fileName}`;

      // Convertir Buffer a Blob
      const blob = new Blob([file.buffer], { type: file.mimetype });

      const { error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, blob, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Delete an image from Supabase Storage
   * @param imageUrl The public URL of the image
   * @returns True if successful
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      const filePath = imageUrl.split('/').pop();
      if (!filePath) {
        throw new Error('Invalid image URL');
      }

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }
} 