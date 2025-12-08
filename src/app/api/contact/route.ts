import { NextRequest, NextResponse } from "next/server";
import { sendContact } from "@/app/services/server/contactService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { status, body: responseBody } = await sendContact(body);

    return NextResponse.json(responseBody, { status });
  } catch {
    return NextResponse.json(
      { error: "אירעה שגיאה בעת שליחת הפנייה" },
      { status: 500 }
    );
  }
}
