// src/services/llm/lmstudio-service.ts
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export class LMStudioService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = process.env.LMSTUDIO_API_URL || 'http://localhost:1234/v1';
  }
  
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
}