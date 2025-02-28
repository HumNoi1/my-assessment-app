// assessment-backend/src/services/vector-db/milvus-collection-setup.ts
import { milvusClient } from './milvus-client';
import { DataType } from '@zilliz/milvus2-sdk-node';

/**
 * ฟังก์ชันสำหรับตรวจสอบว่ามี collection ที่กำหนดอยู่แล้วหรือไม่
 */
export async function collectionExists(collectionName: string): Promise<boolean> {
  try {
    const response = await milvusClient.hasCollection({
      collection_name: collectionName
    });
    return response.value;
  } catch (error) {
    console.error(`Error checking collection ${collectionName}:`, error);
    return false;
  }
}

/**
 * สร้าง Collection สำหรับเก็บ embeddings ของเฉลย
 */
export async function createAnswerKeyEmbeddingsCollection(): Promise<boolean> {
  const collectionName = 'answer_key_embeddings';
  
  try {
    // ตรวจสอบว่า collection มีอยู่แล้วหรือไม่
    const exists = await collectionExists(collectionName);
    if (exists) {
      console.log(`Collection ${collectionName} already exists`);
      return true;
    }
    
    // สร้าง collection ใหม่
    await milvusClient.createCollection({
      collection_name: collectionName,
      fields: [
        {
          name: 'id',
          data_type: DataType.Int64,
          is_primary_key: true,
          autoID: true
        },
        {
          name: 'answer_key_id',
          data_type: DataType.VarChar,
          max_length: 36
        },
        {
          name: 'chunk_id',
          data_type: DataType.Int64
        },
        {
          name: 'content_chunk',
          data_type: DataType.VarChar,
          max_length: 65535
        },
        {
          name: 'embedding',
          data_type: DataType.FloatVector,
          dim: 1536 // ขนาด embedding vector ของ OpenAI embeddings
        },
        {
          name: 'metadata',
          data_type: DataType.JSON
        }
      ]
    });
    
    // สร้าง index
    await milvusClient.createIndex({
      collection_name: collectionName,
      field_name: 'embedding',
      index_type: 'HNSW',
      metric_type: 'COSINE',
      params: {
        M: 8,
        efConstruction: 200
      }
    });
    
    console.log(`Collection ${collectionName} created successfully`);
    return true;
  } catch (error) {
    console.error(`Error creating collection ${collectionName}:`, error);
    return false;
  }
}

/**
 * สร้าง Collection สำหรับเก็บ embeddings ของคำตอบนักเรียน
 */
export async function createStudentAnswerEmbeddingsCollection(): Promise<boolean> {
  const collectionName = 'student_answer_embeddings';
  
  try {
    // ตรวจสอบว่า collection มีอยู่แล้วหรือไม่
    const exists = await collectionExists(collectionName);
    if (exists) {
      console.log(`Collection ${collectionName} already exists`);
      return true;
    }
    
    // สร้าง collection ใหม่
    await milvusClient.createCollection({
      collection_name: collectionName,
      fields: [
        {
          name: 'id',
          data_type: DataType.Int64,
          is_primary_key: true,
          autoID: true
        },
        {
          name: 'student_answer_id',
          data_type: DataType.VarChar,
          max_length: 36
        },
        {
          name: 'chunk_id',
          data_type: DataType.Int64
        },
        {
          name: 'content_chunk',
          data_type: DataType.VarChar,
          max_length: 65535
        },
        {
          name: 'embedding',
          data_type: DataType.FloatVector,
          dim: 1536 // ขนาด embedding vector ของ OpenAI embeddings
        },
        {
          name: 'metadata',
          data_type: DataType.JSON
        }
      ]
    });
    
    // สร้าง index
    await milvusClient.createIndex({
      collection_name: collectionName,
      field_name: 'embedding',
      index_type: 'HNSW',
      metric_type: 'COSINE',
      params: {
        M: 8,
        efConstruction: 200
      }
    });
    
    console.log(`Collection ${collectionName} created successfully`);
    return true;
  } catch (error) {
    console.error(`Error creating collection ${collectionName}:`, error);
    return false;
  }
}

/**
 * สร้าง Collection ทั้งหมดที่จำเป็นสำหรับระบบ
 */
export async function setupAllCollections(): Promise<boolean> {
  try {
    const answerKeyResult = await createAnswerKeyEmbeddingsCollection();
    const studentAnswerResult = await createStudentAnswerEmbeddingsCollection();
    
    return answerKeyResult && studentAnswerResult;
  } catch (error) {
    console.error('Error setting up collections:', error);
    return false;
  }
}