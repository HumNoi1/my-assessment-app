// assessment-backend/src/services/vector-db/milvus-client.ts
import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

// ตรวจสอบว่ามีการกำหนดค่าสภาพแวดล้อมที่จำเป็นหรือไม่
const requiredEnvVars = ['MILVUS_ADDRESS', 'MILVUS_USERNAME', 'MILVUS_PASSWORD'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.warn(`Warning: Environment variable ${envVar} is not set`);
  }
});

// สร้าง Milvus client instance
const milvusClient = new MilvusClient({
  address: process.env.MILVUS_ADDRESS || 'localhost:19530',
  username: process.env.MILVUS_USERNAME || '',
  password: process.env.MILVUS_PASSWORD || '',
});

// ฟังก์ชันสำหรับตรวจสอบการเชื่อมต่อ
export async function checkMilvusConnection(): Promise<boolean> {
  try {
    await milvusClient.listCollections();
    console.log('Successfully connected to Milvus');
    return true;
  } catch (error) {
    console.error('Failed to connect to Milvus:', error);
    return false;
  }
}

export { milvusClient };