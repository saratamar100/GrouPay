import { NextRequest, NextResponse } from "next/server";
import { chatWithGrouPayAssistant } from "@/app/services/server/aiChatService";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    const aiReply = await chatWithGrouPayAssistant({
      message,
      history,
    });

    return NextResponse.json(
      {
        response: aiReply,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "שגיאת שרת פנימית" },
      { status: 500 }
    );
  }
}
