// assessment-backend/src/services/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// ตรวจสอบว่ามีการกำหนดค่าสภาพแวดล้อมที่จำเป็นหรือไม่
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Error: Environment variable ${envVar} is not set`);
    process.exit(1);
  }
});

// สร้าง Supabase client instance
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// ฟังก์ชันสำหรับตรวจสอบการเชื่อมต่อ
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('teachers').select('count');
    if (error) throw error;
    console.log('Successfully connected to Supabase');
    return true;
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    return false;
  }
}

export { supabase };