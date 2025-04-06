import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
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
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('receipt-images')
        .upload(filename, buffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipt-images')
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
        .from('receipt-images')
        .remove([path]);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }
} 