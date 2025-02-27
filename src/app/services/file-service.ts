// src/services/file-service.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadFile(
  bucketName: string, 
  filePath: string, 
  file: File
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
      
    if (error) {
      console.error('Error uploading file:', error);
      throw new Error(error.message);
    }
    
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
}

export async function downloadFile(
  bucketName: string, 
  filePath: string
): Promise<Blob | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);
      
    if (error) {
      console.error('Error downloading file:', error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error('Error in downloadFile:', error);
    return null;
  }
}

export async function deleteFile(
  bucketName: string, 
  filePath: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
      
    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
}

export async function getFileUrl(
  bucketName: string, 
  filePath: string
): Promise<string | null> {
  try {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error('Error in getFileUrl:', error);
    return null;
  }
}