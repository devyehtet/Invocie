
import { GoogleGenAI, Type } from "@google/genai";

export const generateProfessionalNotes = async (context: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert Digital Advertising freelancer. Draft a professional invoice "Notes" section based on this campaign context: ${context}. Mention payment terms for ad spending and performance monitoring. Keep it under 60 words.`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text || "Thank you for your business. Please settle ad spend reimbursements promptly.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Thank you for choosing our advertising services.";
  }
};

export const analyzeFinances = async (invoiceData: any) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As a Digital Marketing financial consultant, analyze these advertising invoices and provide 3 key insights on margin, ad-spend-to-fee ratio, and revenue trends: ${JSON.stringify(invoiceData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              insight: { type: Type.STRING },
              action: { type: Type.STRING }
            },
            required: ["insight", "action"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return [];
  }
};
