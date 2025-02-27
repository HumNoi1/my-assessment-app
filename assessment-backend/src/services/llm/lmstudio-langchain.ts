// assessment-backend/src/services/llm/lmstudio-langchain.ts
import { LLM } from "langchain/llms/base";
import { LMStudioService } from "./lmstudio-service";

/**
 * ตัวแปลงสำหรับใช้ LMStudio กับ LangChain
 */
export class LMStudioLLM extends LLM {
  private service: LMStudioService;
  
  constructor(service: LMStudioService) {
    super({});
    this.service = service;
  }
  
  _llmType() {
    return "lmstudio";
  }
  
  async _call(prompt: string): Promise<string> {
    return this.service.generateCompletion(prompt);
  }
}