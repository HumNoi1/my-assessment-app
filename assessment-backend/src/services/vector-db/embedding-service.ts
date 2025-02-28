// assessment-backend/src/services/vector-db/embedding-service.ts
import { lmStudioService } from '../llm/lmstudio-service';
import { milvusClient } from './milvus-service';
import { supabase } from '../supabase/client';
import { DataType } from '@zilliz/milvus2-sdk-node';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

/**
 * คลาสสำหรับจัดการการสร้างและจัดเก็บ embeddings
 */
export class EmbeddingService {
  /**
   * สร้าง embeddings สำหรับไฟล์เฉลย
   * @param answerKeyId ID ของไฟล์เฉลย
   * @param content เนื้อหาของไฟล์เฉลย
   */
  public async createAnswerKeyEmbeddings(answerKeyId: string, content: string): Promise<boolean> {
    try {
      // ตรวจสอบว่ามีข้อมูลไฟล์เฉลยหรือไม่
      const { data: answerKey, error: fetchError } = await supabase
        .from('answer_keys')
        .select('*')
        .eq('answer_key_id', answerKeyId)
        .single();
      
      if (fetchError || !answerKey) {
        console.error('Error fetching answer key:', fetchError);
        return false;
      }

      // แบ่งเนื้อหาเป็นส่วนๆ เพื่อสร้าง embeddings
      const textChunks = await this.splitTextIntoChunks(content);
      
      // ตรวจสอบและสร้างคอลเลกชัน (ถ้ายังไม่มี)
      const collectionName = answerKey.milvus_collection_name;
      await this.ensureCollectionExists(collectionName);
      
      // สร้าง embeddings สำหรับแต่ละส่วนของเนื้อหา
      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];
        
        // สร้าง embedding โดยใช้ LMStudio service
        const embedding = await lmStudioService.generateEmbeddings(chunk);
        
        // จัดเก็บข้อมูลใน Milvus
        await milvusClient.insert({
          collection_name: collectionName,
          data: [
            {
              answer_key_id: answerKeyId,
              chunk_id: i,
              content_chunk: chunk,
              embedding: embedding,
              metadata: JSON.stringify({
                chunk_index: i,
                total_chunks: textChunks.length,
                source_type: 'answer_key'
              })
            }
          ]
        });
      }
      
      console.log(`Successfully created embeddings for answer key ${answerKeyId} with ${textChunks.length} chunks`);
      return true;
    } catch (error) {
      console.error('Error creating answer key embeddings:', error);
      return false;
    }
  }

  /**
   * สร้าง embeddings สำหรับคำตอบนักเรียน
   * @param studentAnswerId ID ของคำตอบนักเรียน
   * @param content เนื้อหาของคำตอบนักเรียน
   */
  public async createStudentAnswerEmbeddings(studentAnswerId: string, content: string): Promise<boolean> {
    try {
      // ตรวจสอบว่ามีข้อมูลคำตอบนักเรียนหรือไม่
      const { data: studentAnswer, error: fetchError } = await supabase
        .from('student_answers')
        .select('*')
        .eq('student_answer_id', studentAnswerId)
        .single();
      
      if (fetchError || !studentAnswer) {
        console.error('Error fetching student answer:', fetchError);
        return false;
      }

      // แบ่งเนื้อหาเป็นส่วนๆ เพื่อสร้าง embeddings
      const textChunks = await this.splitTextIntoChunks(content);
      
      // ตรวจสอบและสร้างคอลเลกชัน (ถ้ายังไม่มี)
      const collectionName = studentAnswer.milvus_collection_name;
      await this.ensureCollectionExists(collectionName);
      
      // สร้าง embeddings สำหรับแต่ละส่วนของเนื้อหา
      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];
        
        // สร้าง embedding โดยใช้ LMStudio service
        const embedding = await lmStudioService.generateEmbeddings(chunk);
        
        // จัดเก็บข้อมูลใน Milvus
        await milvusClient.insert({
          collection_name: collectionName,
          data: [
            {
              student_answer_id: studentAnswerId,
              chunk_id: i,
              content_chunk: chunk,
              embedding: embedding,
              metadata: JSON.stringify({
                chunk_index: i,
                total_chunks: textChunks.length,
                source_type: 'student_answer'
              })
            }
          ]
        });
      }
      
      console.log(`Successfully created embeddings for student answer ${studentAnswerId} with ${textChunks.length} chunks`);
      return true;
    } catch (error) {
      console.error('Error creating student answer embeddings:', error);
      return false;
    }
  }

  /**
   * ค้นหาเนื้อหาที่เกี่ยวข้องจาก embedding vectors
   * @param query เนื้อหาที่ต้องการค้นหา
   * @param collectionName ชื่อคอลเลกชันใน Milvus
   * @param topK จำนวนผลลัพธ์สูงสุดที่ต้องการ
   * @returns ผลลัพธ์ที่เกี่ยวข้อง
   */
  public async searchSimilarContent(query: string, collectionName: string, topK: number = 5): Promise<{ content_chunk: string, metadata: string, distance: number }[]> {
    try {
      // สร้าง embedding สำหรับข้อความค้นหา
      const queryEmbedding = await lmStudioService.generateEmbeddings(query);
      
      // ค้นหาใน Milvus
      const searchResult = await milvusClient.search({
        collection_name: collectionName,
        vector: queryEmbedding,
        output_fields: ['content_chunk', 'metadata'],
        limit: topK,
        params: { metric_type: 'COSINE' }
      });
      
      return searchResult.results.map(result => ({
        content_chunk: result.content_chunk as string,
        metadata: result.metadata as string,
        distance: result.distance
      }));
    } catch (error) {
      console.error('Error searching similar content:', error);
      return [];
    }
  }

  /**
   * ตรวจสอบและสร้างคอลเลกชันเก็บ embeddings ใน Milvus (ถ้ายังไม่มี)
   * @param collectionName ชื่อคอลเลกชันที่ต้องการตรวจสอบหรือสร้าง
   */
  private async ensureCollectionExists(collectionName: string): Promise<void> {
    try {
      // ตรวจสอบว่ามีคอลเลกชันอยู่แล้วหรือไม่
      const hasCollection = await milvusClient.hasCollection({
        collection_name: collectionName
      });
      
      if (hasCollection.value) {
        // มีคอลเลกชันอยู่แล้ว ไม่ต้องสร้างใหม่
        return;
      }
      
      // สร้างคอลเลกชันใหม่
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
      
      // สร้าง index สำหรับการค้นหาแบบ vector similarity
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
      
      console.log(`Created new Milvus collection: ${collectionName}`);
    } catch (error) {
      console.error(`Error ensuring collection exists for ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * แบ่งข้อความเป็นส่วนๆ เพื่อสร้าง embeddings
   * @param text ข้อความที่ต้องการแบ่ง
   * @returns ส่วนต่างๆ ของข้อความ
   */
  private async splitTextIntoChunks(text: string): Promise<string[]> {
    try {
      // ใช้ LangChain text splitter เพื่อแบ่งข้อความเป็นส่วนๆ
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100
      });
      
      return await splitter.splitText(text);
    } catch (error) {
      console.error('Error splitting text into chunks:', error);
      // ถ้าแบ่งข้อความไม่สำเร็จ ให้ใช้วิธีพื้นฐานแทน
      return this.basicTextSplitter(text, 1000, 100);
    }
  }

  /**
   * วิธีพื้นฐานในการแบ่งข้อความเป็นส่วนๆ (ใช้เป็น fallback)
   * @param text ข้อความที่ต้องการแบ่ง
   * @param chunkSize ขนาดของแต่ละส่วน
   * @param overlap ขนาดของการซ้อนทับระหว่างส่วน
   * @returns ส่วนต่างๆ ของข้อความ
   */
  private basicTextSplitter(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      const chunk = text.substring(i, i + chunkSize);
      chunks.push(chunk);
    }
    
    return chunks;
  }
}

// สร้าง instance เดียวสำหรับใช้งานทั้งระบบ
export const embeddingService = new EmbeddingService();