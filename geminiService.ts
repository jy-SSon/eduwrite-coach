
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "./constants";

export class GeminiService {
  /**
   * Generates reflective records based on student input data.
   * Following the "API Key Selection" guidelines: Create a new GoogleGenAI instance right before making an API call.
   */
  async generateRecords(inputData: any): Promise<any> {
    // API Key Selection race condition: instantiate right before call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        // Using gemini-3-pro-preview for complex reasoning and educational document generation.
        model: "gemini-3-pro-preview",
        contents: [{ 
          parts: [{ 
            text: `다음 학생 활동 데이터를 바탕으로 요청된 성찰 문서를 작성해줘. 
            데이터: ${JSON.stringify(inputData)}` 
          }] 
        }],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              form_fill: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "문서의 제목" },
                  content: { type: Type.STRING, description: "문단형 본문 내용" }
                },
                required: ["title", "content"]
              },
              print_view: {
                type: Type.STRING,
                description: "인쇄용으로 포맷팅된 전체 텍스트",
              }
            },
            required: ["form_fill", "print_view"]
          }
        },
      });

      // Using response.text property directly as per guidelines
      const text = response.text;
      if (!text) {
        throw new Error("AI가 응답을 생성하지 못했습니다. 다시 시도해 주세요.");
      }

      return JSON.parse(text.trim());
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      // Handle "Requested entity was not found" error by suggesting key re-selection
      if (error?.message?.includes("Requested entity was not found")) {
        throw new Error("API 키 설정에 문제가 있습니다. 키를 다시 선택해 주세요.");
      }
      
      throw new Error(error?.message || "AI 서비스 호출 중 오류가 발생했습니다.");
    }
  }
}

export const geminiService = new GeminiService();
