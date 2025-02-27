// assessment-backend/src/services/llm/lmstudio-service.ts
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export class LMStudioService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = process.env.LMSTUDIO_API_URL || 'http://localhost:1234/v1';
  }
  
  /**
   * สร้าง embeddings จากข้อความที่กำหนด
   * @param text ข้อความที่ต้องการสร้าง embeddings
   * @returns embeddings vector
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/embeddings`, {
        input: text,
        model: process.env.EMBEDDING_MODEL || 'local-embedding-model',
      });
      
      return response.data.data[0].embedding;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }
  
  /**
   * สร้างการตอบกลับจาก LLM ด้วย prompt ที่กำหนด
   * @param prompt คำถามหรือ prompt ที่ต้องการให้ LLM ตอบ
   * @returns คำตอบจาก LLM
   */
  async generateCompletion(prompt: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        messages: [{ role: 'user', content: prompt }],
        model: process.env.LLM_MODEL || 'local-llm-model',
        temperature: 0.3,
        max_tokens: 1000,
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating completion:', error);
      throw error;
    }
  }
  
  /**
   * ตรวจสอบการเชื่อมต่อกับ LMStudio
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/models`);
      console.log('Successfully connected to LMStudio');
      console.log('Available models:', response.data);
      return true;
    } catch (error) {
      console.error('Failed to connect to LMStudio:', error);
      return false;
    }
  }
}

// สร้าง instance เดียวสำหรับใช้งานทั้งระบบ
export const lmStudioService = new LMStudioService();