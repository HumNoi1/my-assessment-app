// assessment-backend/src/services/llm/enhanced-assessment-service.ts
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { supabase } from "../supabase/client";
import { embeddingService } from "../vector-db/embedding-service";
import { lmStudioService } from "./lmstudio-service";
import { LMStudioLLM } from "./lmstudio-langchain";

export class AssessmentService {
  private llm: BaseLanguageModel;
  private confidence: number = 0;
  
  constructor() {
    // ใช้ LMStudio เป็น LLM ในระบบ LangChain
    this.llm = new LMStudioLLM(lmStudioService);
  }
  
  /**
   * วิเคราะห์และประเมินคำตอบนักเรียนโดยใช้ RAG
   * @param studentAnswerId ID ของคำตอบนักเรียน
   * @param answerKeyId ID ของเฉลย
   * @returns ผลการประเมิน
   */
  async analyzeStudentAnswer(studentAnswerId: string, answerKeyId: string) {
    try {
      // 1. ดึงข้อมูลคำตอบนักเรียนและเฉลย
      const studentAnswer = await this.fetchStudentAnswer(studentAnswerId);
      const answerKey = await this.fetchAnswerKey(answerKeyId);
      
      if (!studentAnswer || !answerKey) {
        throw new Error('Student answer or answer key not found');
      }
      
      // 2. ดึงส่วนของเฉลยที่เกี่ยวข้องกับคำตอบนักเรียนโดยใช้ semantic search
      const relevantKeyChunks = await this.retrieveRelevantKeyChunks(
        studentAnswer.content, 
        answerKey.milvus_collection_name
      );
      
      // 3. สร้าง prompt ที่มีบริบทของเฉลยและคำตอบนักเรียน
      const promptTemplate = new PromptTemplate({
        template: `
        คุณเป็นผู้ช่วยในการตรวจข้อสอบอัตนัย โปรดประเมินคำตอบของนักเรียนโดยเปรียบเทียบกับเฉลย

        เฉลย:
        {answerKey}

        คำตอบของนักเรียน:
        {studentAnswer}

        โปรดตรวจคำตอบและให้:
        1. คะแนน (0-10)
        2. ข้อเสนอแนะที่เป็นประโยชน์
        3. ระดับความมั่นใจในการประเมิน (0-100%)

        ตอบในรูปแบบ JSON ตามนี้:
        {
          "score": [คะแนน],
          "feedback": "[ข้อเสนอแนะ]",
          "confidence": [ระดับความมั่นใจ]
        }
        `,
        inputVariables: ["answerKey", "studentAnswer"],
      });
      
      // 4. ส่ง prompt ไปยัง LLM ผ่าน LangChain
      const chain = new LLMChain({ llm: this.llm, prompt: promptTemplate });
      const response = await chain.call({
        answerKey: relevantKeyChunks.join("\n"),
        studentAnswer: studentAnswer.content,
      });
      
      // 5. แปลงผลลัพธ์และบันทึกการประเมิน
      let result;
      try {
        result = JSON.parse(response.text);
      } catch (error) {
        console.error('Error parsing LLM response:', error);
        throw new Error('Invalid response format from LLM');
      }
      
      // บันทึกผลการประเมิน
      const assessment = await this.saveAssessment(
        studentAnswerId, 
        answerKeyId, 
        result.score, 
        result.feedback, 
        result.confidence
      );
      
      // บันทึกการใช้งาน LLM
      await this.logLLMUsage(
        assessment.assessment_id,
        'analyze_answer',
        await promptTemplate.format({
          answerKey: relevantKeyChunks.join("\n"),
          studentAnswer: studentAnswer.content
        }),
        response.text,
        result.confidence
      );
      
      return {
        ...result,
        assessment_id: assessment.assessment_id,
        studentAnswer,
        answerKey
      };
    } catch (error) {
      console.error('Error analyzing student answer:', error);
      throw error;
    }
  }
  
  /**
   * ค้นหาส่วนของเฉลยที่เกี่ยวข้องกับคำตอบนักเรียน
   * @param studentAnswerText เนื้อหาคำตอบนักเรียน
   * @param collectionName ชื่อคอลเลกชันของเฉลย
   * @returns ส่วนของเฉลยที่เกี่ยวข้อง
   */
  private async retrieveRelevantKeyChunks(studentAnswerText: string, collectionName: string): Promise<string[]> {
    try {
      // ค้นหาส่วนของเฉลยที่เกี่ยวข้อง
      const searchResults = await embeddingService.searchSimilarContent(
        studentAnswerText,
        collectionName,
        5 // จำนวนผลลัพธ์ที่ต้องการ
      );
      
      // แปลงผลลัพธ์เป็นข้อความ
      return searchResults.map(result => result.content_chunk);
    } catch (error) {
      console.error('Error retrieving relevant key chunks:', error);
      return [];
    }
  }
  
  /**
   * ดึงข้อมูลคำตอบนักเรียน
   * @param id ID ของคำตอบนักเรียน
   * @returns ข้อมูลคำตอบนักเรียน
   */
  private async fetchStudentAnswer(id: string) {
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .select(`
          *,
          student:students(*)
        `)
        .eq('student_answer_id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching student answer:', error);
      return null;
    }
  }
  
  /**
   * ดึงข้อมูลเฉลย
   * @param id ID ของเฉลย
   * @returns ข้อมูลเฉลย
   */
  private async fetchAnswerKey(id: string) {
    try {
      const { data, error } = await supabase
        .from('answer_keys')
        .select(`
          *,
          subject:subjects(*)
        `)
        .eq('answer_key_id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching answer key:', error);
      return null;
    }
  }
  
  /**
   * บันทึกผลการประเมิน
   * @param studentAnswerId ID ของคำตอบนักเรียน
   * @param answerKeyId ID ของเฉลย
   * @param score คะแนน
   * @param feedback ข้อเสนอแนะ
   * @param confidence ความมั่นใจในการประเมิน
   * @returns ข้อมูลการประเมินที่บันทึกแล้ว
   */
  private async saveAssessment(
    studentAnswerId: string,
    answerKeyId: string,
    score: number,
    feedback: string,
    confidence: number
  ) {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          student_answer_id: studentAnswerId,
          answer_key_id: answerKeyId,
          score: score,
          max_score: 10, // กำหนดคะแนนเต็มเป็น 10
          feedback_text: feedback,
          feedback_json: { detail: feedback },
          confidence: confidence,
          is_approved: false,
          assessment_date: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving assessment:', error);
      throw error;
    }
  }
  
  /**
   * บันทึกการใช้งาน LLM
   * @param assessmentId ID ของการประเมิน
   * @param operationType ประเภทการดำเนินการ
   * @param inputPrompt prompt ที่ส่งให้ LLM
   * @param outputText ผลลัพธ์จาก LLM
   * @param confidence ความมั่นใจในการประมวลผล
   */
  private async logLLMUsage(
    assessmentId: string,
    operationType: string,
    inputPrompt: string,
    outputText: string,
    confidence: number
  ) {
    try {
      await supabase
        .from('llm_usage_logs')
        .insert({
          operation_type: operationType,
          input_prompt: inputPrompt,
          output_text: outputText,
          processing_time: 1.0, // ตั้งค่าเริ่มต้น
          token_count: this.estimateTokenCount(inputPrompt) + this.estimateTokenCount(outputText),
          assessment_id: assessmentId,
          confidence: confidence
        });
    } catch (error) {
      console.error('Error logging LLM usage:', error);
      // ไม่ throw error เพื่อไม่ให้กระทบการทำงานหลัก
    }
  }
  
  /**
   * ประมาณจำนวน token จากข้อความ
   * @param text ข้อความที่ต้องการประมาณ token
   * @returns จำนวน token ที่ประมาณได้
   */
  private estimateTokenCount(text: string): number {
    // วิธีการประมาณอย่างง่าย: 1 token ≈ 4 ตัวอักษร
    return Math.ceil(text.length / 4);
  }
  
  /**
   * เปรียบเทียบคำตอบนักเรียนกับเฉลย
   * @param studentAnswerId ID ของคำตอบนักเรียน
   * @param answerKeyId ID ของเฉลย
   * @returns ผลการเปรียบเทียบ
   */
  async compareAnswers(studentAnswerId: string, answerKeyId: string) {
    try {
      // ดึงข้อมูลคำตอบนักเรียนและเฉลย
      const studentAnswer = await this.fetchStudentAnswer(studentAnswerId);
      const answerKey = await this.fetchAnswerKey(answerKeyId);
      
      if (!studentAnswer || !answerKey) {
        throw new Error('Student answer or answer key not found');
      }
      
      // สร้าง prompt สำหรับเปรียบเทียบ
      const promptTemplate = new PromptTemplate({
        template: `
        คุณเป็นผู้ช่วยในการเปรียบเทียบคำตอบของนักเรียนกับเฉลย โปรดวิเคราะห์ความเหมือนและความแตกต่าง

        เฉลย:
        {answerKey}

        คำตอบของนักเรียน:
        {studentAnswer}

        โปรดวิเคราะห์และให้:
        1. ประเด็นที่นักเรียนตอบถูกต้อง
        2. ประเด็นที่นักเรียนตอบผิด
        3. ประเด็นที่นักเรียนไม่ได้กล่าวถึง
        4. ข้อเสนอแนะเพื่อปรับปรุง

        ตอบในรูปแบบ JSON ตามนี้:
        {
          "correct_points": ["ประเด็นที่ถูกต้อง 1", "ประเด็นที่ถูกต้อง 2", ...],
          "incorrect_points": ["ประเด็นที่ไม่ถูกต้อง 1", "ประเด็นที่ไม่ถูกต้อง 2", ...],
          "missing_points": ["ประเด็นที่ขาดหาย 1", "ประเด็นที่ขาดหาย 2", ...],
          "suggestions": "ข้อเสนอแนะโดยรวม"
        }
        `,
        inputVariables: ["answerKey", "studentAnswer"],
      });
      
      // ส่ง prompt ไปยัง LLM
      const chain = new LLMChain({ llm: this.llm, prompt: promptTemplate });
      const response = await chain.call({
        answerKey: answerKey.content,
        studentAnswer: studentAnswer.content,
      });
      
      // แปลงผลลัพธ์เป็น JSON
      let result;
      try {
        result = JSON.parse(response.text);
      } catch (error) {
        console.error('Error parsing LLM response:', error);
        throw new Error('Invalid response format from LLM');
      }
      
      // บันทึกการใช้งาน LLM
      await this.logLLMUsage(
        "none", // ไม่เชื่อมโยงกับการประเมินโดยตรง
        'compare_answers',
        await promptTemplate.format({
          answerKey: answerKey.content,
          studentAnswer: studentAnswer.content
        }),
        response.text,
        100 // ความมั่นใจเต็ม 100% สำหรับการเปรียบเทียบ
      );
      
      return {
        ...result,
        studentAnswer,
        answerKey
      };
    } catch (error) {
      console.error('Error comparing answers:', error);
      throw error;
    }
  }
}

// สร้าง instance เดียวสำหรับใช้งานทั้งระบบ
export const enhancedAssessmentService = new AssessmentService();