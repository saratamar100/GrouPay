import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_2 });

const REVIEW_MODERATOR_INSTRUCTION = `
תפקידך לסנן ביקורות עבור אפליקציית GrouPay.
עליך לנתח את הטקסט שנשלח אליך:
1. אם הטקסט הוא המלצה חיובית, פרגון, או חוויה טובה - ענה אך ורק במילה אחת: POSITIVE.
2. אם הטקסט הוא תלונה על באג, בעיה טכנית, חוויה שלילית או תוכן פוגעני או תגובה מעליבה או כל דבר שאינו חיובי לחלוטין- ענה אך ורק במילה אחת: NEGATIVE.
אין להוסיף הסברים, סימני פיסוק או מילים נוספות.
`;

export async function analyzeReviewSentiment(
  content: string
): Promise<boolean> {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: [],
      config: {
        systemInstruction: REVIEW_MODERATOR_INSTRUCTION,
        temperature: 0.1,
      },
    });
    const response = await chat.sendMessage({ message: content });

    if (!response || !response.text) {
      console.warn("AI returned an empty response or was blocked.");
      return true;
    }

    const text = response.text.trim().toUpperCase();

    return text.includes("POSITIVE");
  } catch (error) {
    console.error("Gemini AI Service Error:", error);
    return true;
  }
}
