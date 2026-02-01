
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

export class GeminiService {
  /**
   * Generates reflective records. Automatically switches to offline mode if internet is unavailable.
   */
  async generateRecords(inputData: any): Promise<any> {
    // Check if browser is offline
    if (!navigator.onLine) {
      console.log("Offline mode detected. Using local template engine.");
      return this.generateOffline(inputData);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
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

      const text = response.text;
      if (!text) {
        throw new Error("AI 응답 없음");
      }

      return JSON.parse(text.trim());
    } catch (error: any) {
      console.error("Gemini API Error, falling back to offline engine:", error);
      return this.generateOffline(inputData);
    }
  }

  /**
   * Offline generation engine: Constructs a structured document based on raw inputs.
   */
  private generateOffline(data: any): any {
    const type = data.target_doc;
    const profile = data.student_profile;
    let title = "";
    let content = "";

    if (type === 'self') {
      const inputs = data.self_eval_inputs;
      title = `${profile.subject} 교과 활동 자기평가서 (${profile.name})`;
      content = `
        <h1>${title}</h1>
        <table border="1" style="border-collapse: collapse; width: 100%; border: 0.15mm solid black; margin-bottom: 20px;">
          <tr><th>교과목</th><td>${profile.subject}</td><th>활동명</th><td>${profile.activityName}</td></tr>
          <tr><th>성명</th><td>${profile.name}</td><th>기간</th><td>${profile.period}</td></tr>
        </table>
        <h2>1. 탐구 동기 및 목적</h2>
        <p>${inputs.motivation}</p>
        <h2>2. 주요 활동 및 역할</h2>
        <p>${inputs.process}</p>
        <h2>3. 문제 해결 과정</h2>
        <p>${inputs.troubleshooting}</p>
        <h2>4. 배운 점 및 성취</h2>
        <p>${inputs.achievement}</p>
        <h2>5. 향후 계획</h2>
        <p>${inputs.vision}</p>
        <p style="color: #666; font-size: 0.8rem; margin-top: 30px;">* 본 문서는 오프라인 모드에서 기본 템플릿으로 생성되었습니다.</p>
      `;
    } else if (type === 'peer') {
      const inputs = data.peer_eval_inputs;
      title = `${profile.subject} 동료평가서 (${profile.name} 관찰)`;
      content = `
        <h1>${title}</h1>
        <h2>1. 관찰 활동 맥락</h2>
        <p>${inputs.context}</p>
        <h2>2. 주요 관찰 행동</h2>
        <p>${inputs.actions}</p>
        <h2>3. 팀 기여도 및 역량</h2>
        <p>${inputs.contribution}</p>
        <h2>4. 총평 및 피드백</h2>
        <p>${inputs.feedback}</p>
      `;
    } else if (type === 'inquiry_report') {
      const inputs = data.inquiry_report_inputs;
      title = `[탐구보고서] ${profile.activityName}`;
      content = `
        <h1>${title}</h1>
        <table border="1" style="border-collapse: collapse; width: 100%; border: 0.15mm solid black; margin-bottom: 20px;">
          <tr><th>분야</th><td>${inputs.field}</td><th>연구팀</th><td>${inputs.groupDetails}</td></tr>
        </table>
        <h2>Ⅰ. 서론</h2>
        <h3>1. 탐구 목적</h3><p>${inputs.purpose}</p>
        <h2>Ⅱ. 본론</h2>
        <h3>1. 주요 탐구 내용</h3><p>${inputs.mainContent}</p>
        <h2>Ⅲ. 결론</h2>
        <h3>1. 요약 및 제언</h3><p>${inputs.conclusion}</p>
        <h2>Ⅳ. 참고문헌</h2>
        <p>${inputs.references}</p>
      `;
    } else {
      const inputs = data.inquiry_plan_inputs;
      title = `[탐구계획서] ${inputs.finalTopic}`;
      content = `
        <h1>${title}</h1>
        <h2>1. 탐구 주제</h2><p>${inputs.finalTopic}</p>
        <h2>2. 탐구 동기</h2><p>${inputs.motivation}</p>
        <h2>3. 탐구 방법</h2><p>${inputs.methods}</p>
        <h2>4. 예상 결과</h2><p>${inputs.expectedResult}</p>
      `;
    }

    return {
      form_fill: { title, content },
      print_view: content.replace(/<[^>]*>?/gm, '\n').trim()
    };
  }
}

export const geminiService = new GeminiService();
