// src/services/llm/assessment-service.ts
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/base_language";
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

export class AssessmentService {
  private milvusClient: MilvusClient;
  private llm: BaseLanguageModel;
  
  constructor(milvusClient: MilvusClient, llm: BaseLanguageModel) {
    this.milvusClient = milvusClient;
    this.llm = llm;
  }
  
  async analyzeStudentAnswer(studentAnswerId: string, answerKeyId: string) {
    // 1. ดึงข้อมูลคำตอบนักเรียนและเฉลยจาก Supabase
    const studentAnswer = await this.fetchStudentAnswer(studentAnswerId);
    const answerKey = await this.fetchAnswerKey(answerKeyId);
    
    // 2. ดึง embeddings ที่เกี่ยวข้องจาก Milvus
    const relevantKeyChunks = await this.retrieveRelevantKeyChunks(
      studentAnswer.content, 
      answerKey.milvusCollectionName
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
    const result = JSON.parse(response.text);
    await this.saveAssessment(studentAnswerId, answerKeyId, result);
    
    return {
      ...result,
      studentAnswer,
      answerKey,
    };
  }
  
  private async retrieveRelevantKeyChunks(studentAnswerText: string, collectionName: string) {
    // Logic to retrieve relevant chunks from Milvus
    // This will involve using the Milvus client to search for similar vectors
    // ...
  }
  
  private async fetchStudentAnswer(id: string) {
    // Logic to fetch student answer from Supabase
    // ...
  }
  
  private async fetchAnswerKey(id: string) {
    // Logic to fetch answer key from Supabase
    // ...
  }
  
  private async saveAssessment(studentAnswerId: string, answerKeyId: string, result: any) {
    // Logic to save assessment results to Supabase
    // ...
  }
}