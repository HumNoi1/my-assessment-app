// assessment-backend/src/services/processors/student-answer-processor.ts
import { supabase } from '../supabase/client';
import { uploadFile } from '../supabase/file-service';
import { embeddingService } from '../vector-db/embedding-service';

export class StudentAnswerProcessor {
  /**
   * ประมวลผลคำตอบนักเรียนเพื่อสร้างและจัดเก็บ embeddings
   * @param studentAnswerId ID ของคำตอบนักเรียน
   * @returns สถานะการประมวลผล
   */
  public async processStudentAnswer(studentAnswerId: string): Promise<boolean> {
    try {
      console.log(`Processing student answer: ${studentAnswerId}`);
      
      // ดึงข้อมูลคำตอบนักเรียน
      const { data: studentAnswer, error: fetchError } = await supabase
        .from('student_answers')
        .select('*')
        .eq('student_answer_id', studentAnswerId)
        .single();
      
      if (fetchError || !studentAnswer) {
        console.error('Error fetching student answer:', fetchError);
        return false;
      }
      
      // สร้าง embeddings
      const success = await embeddingService.createStudentAnswerEmbeddings(
        studentAnswerId,
        studentAnswer.content
      );
      
      if (success) {
        // อัปเดตสถานะการประมวลผล
        await supabase
          .from('student_answers')
          .update({ processed: true, processed_at: new Date().toISOString() })
          .eq('student_answer_id', studentAnswerId);
        
        console.log(`Successfully processed student answer: ${studentAnswerId}`);
        return true;
      } else {
        console.error(`Failed to process student answer: ${studentAnswerId}`);
        return false;
      }
    } catch (error) {
      console.error('Error processing student answer:', error);
      return false;
    }
  }
  
  /**
   * อัปโหลดและประมวลผลคำตอบนักเรียน
   * @param file ไฟล์คำตอบนักเรียน
   * @param metadata ข้อมูลเพิ่มเติมของคำตอบนักเรียน
   * @returns ข้อมูลคำตอบนักเรียนที่อัปโหลดแล้ว
   */
  public async uploadAndProcessStudentAnswer(
    file: Buffer,
    fileName: string,
    content: string,
    studentId: string,
    answerKeyId: string,
    folderId: string,
    contentType: string
  ): Promise<any> {
    try {
      console.log(`Uploading student answer: ${fileName}`);
      
      // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
      const timestamp = Date.now();
      const filePath = `student_answers/${folderId}/${timestamp}_${fileName}`;
      
      // อัปโหลดไฟล์ไปยัง Supabase Storage
      await uploadFile('student_answers', filePath, file, contentType);
      
      // สร้างชื่อคอลเลกชันสำหรับ Milvus
      const milvusCollectionName = `student_answer_${timestamp}`;
      
      // บันทึกข้อมูลในฐานข้อมูล
      const { data, error } = await supabase
        .from('student_answers')
        .insert({
          file_name: fileName,
          content: content,
          file_path: filePath,
          file_size: file.length,
          file_type: contentType,
          student_id: studentId,
          answer_key_id: answerKeyId,
          folder_id: folderId,
          milvus_collection_name: milvusCollectionName,
          processed: false
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error inserting student answer record:', error);
        throw error;
      }
      
      // ประมวลผลคำตอบนักเรียนเพื่อสร้าง embeddings (เริ่มกระบวนการแบบ async)
      this.processStudentAnswer(data.student_answer_id).catch(err => {
        console.error('Error in async processing of student answer:', err);
      });
      
      return data;
    } catch (error) {
      console.error('Error uploading and processing student answer:', error);
      throw error;
    }
  }
}

// สร้าง instance เดียวสำหรับใช้งานทั้งระบบ
export const studentAnswerProcessor = new StudentAnswerProcessor();