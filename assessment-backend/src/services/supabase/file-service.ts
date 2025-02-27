// src/services/supabase/file-service.ts
import { supabase } from './client';

export async function uploadFile(
  bucketName: string,
  filePath: string,
  file: Buffer,
  contentType: string
) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      contentType,
      upsert: true,
    });
    
  if (error) throw error;
  return data;
}

export async function getFileUrl(bucketName: string, filePath: string) {
  const { data } = await supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
    
  return data.publicUrl;
}