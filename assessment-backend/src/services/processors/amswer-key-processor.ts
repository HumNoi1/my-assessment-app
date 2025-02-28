// assessment-backend/src/services/processors/answer-key-processor.ts
import { supabase } from '../supabase/client';
import { uploadFile } from '../supabase/file-service';
import { embeddingService } from '../vector-db/embedding-service';

export class AnswerKeyProcessor {
  /**
   * ประมวลผลไฟล์เฉลยเพื่อสร้างและจัดเก็บ embeddings
   * @param answerKeyId ID ของไฟล์เฉลย
   * @returns สถานะการประมวลผล
   */
  public async processAnswerKey(answerKeyId: string): Promise<boolean> {
    try {
      console.log(`Processing answer key: ${answerKeyId}`);
      
      // ดึงข้อมูลไฟล์เฉลย
      const { data: answerKey, error: fetchError } = await supabase
        .from('answer_keys')
        .select('*')
        .eq('answer_key_id', answerKeyId)
        .single();
      
      if (fetchError || !answerKey) {
        console.error('Error fetching answer key:', fetchError);
        return false;
      }
      
      // สร้าง embeddings
      const success = await embeddingService.createAnswerKeyEmbeddings(
        answerKeyId,
        answerKey.content
      );
      
      if (success) {
        // อัปเดตสถานะการประมวลผล
        await supabase
          .from('answer_keys')
          .update({ processed: true, processed_at: new Date().toISOString() })
          .eq('answer_key_id', answerKeyId);
        
        console.log(`Successfully processed answer key: ${answerKeyId}`);
        return true;
      } else {
        console.error(`Failed to process answer key: ${answerKeyId}`);
        return false;
      }
    } catch (error) {
      console.error('Error processing answer key:', error);
      return false;
    }
  }
  
  /**
   * อัปโหลดและประมวลผลไฟล์เฉลย
   * @param file ไฟล์เฉลย
   * @param metadata ข้อมูลเพิ่มเติมของไฟล์เฉลย
   * @returns ข้อมูลไฟล์เฉลยที่อัปโหลดแล้ว
   */
  public async uploadAndProcessAnswerKey(
    file: Buffer,
    fileName: string,
    content: string,
    subjectId: string,
    termId: string,
    contentType: string
  ): Promise<any> {
    try {
      console.log(`Uploading answer key: ${fileName}`);
      
      // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
      const timestamp = Date.now();
      const filePath = `answer_keys/${subjectId}/${timestamp}_${fileName}`;
      
      // อัปโหลดไฟล์ไปยัง Supabase Storage
      await uploadFile('answer_keys', filePath, file, contentType);
      
      // สร้างชื่อคอลเลกชันสำหรับ Milvus
      const milvusCollectionName = `answer_key_${timestamp}`;
      
      // บันทึกข้อมูลในฐานข้อมูล
      const { data, error } = await supabase
        .from('answer_keys')
        .insert({
          file_name: fileName,
          content: content,
          file_path: filePath,
          file_size: file.length,
          file_type: contentType,
          subject_id: subjectId,
          term_id: termId,
          milvus_collection_name: milvusCollectionName,
          processed: false
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error inserting answer key record:', error);
        throw error;
      }
      
      // ประมวลผลไฟล์เฉลยเพื่อสร้าง embeddings (เริ่มกระบวนการแบบ async)
      this.processAnswerKey(data.answer_key_id).catch(err => {
        console.error('Error in async processing of answer key:', err);
      });
      
      return data;
    } catch (error) {
      console.error('Error uploading and processing answer key:', error);
      throw error;
    }
  }
}

// สร้าง instance เดียวสำหรับใช้งานทั้งระบบ
export const answerKeyProcessor = new AnswerKeyProcessor();