import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
אתה בוט שירות לקוחות ידידותי שנקרא "GrouPay Assistant".
תפקידך לענות על שאלות משתמשים בנוגע לאפליקציית GrouPay.
אסור לך לענות על שאלות שאינן קשורות ל-GrouPay או לכסף.
GrouPay היא אפליקציה לניהול הוצאות קבוצתיות, לטיולים, שותפים לדירה או אירועים.
* התכונה המרכזית היא חלוקה הוגנת של הוצאות והצגת יתרות (מי חייב למי).
* משתמש יכול להגדיר קבוצה כ"לא פעילה" כדי להקפיא הוצאות עתידיות.
* לצורך ניווט, הדשבורד הוא "/dashboard" וכל קבוצה היא "/groups/[id]".
* יש לשמור על טון קצר ומנומס.
`;

type HistoryItem = {
  role: string;
  message: string;
};

export async function chatWithGrouPayAssistant(params: {
  message: string;
  history: HistoryItem[];
}) {
  const { message, history } = params;

  const processedHistory = (history ?? []).map((item) => ({
    role: item.role,
    parts: [{ text: item.message }],
  }));

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: processedHistory,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.5,
    },
  });

  const response = await chat.sendMessage({ message });

  return response.text;
}
