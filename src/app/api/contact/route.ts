// src/app/api/contact/route.ts
import { NextResponse } from "next/server";
import { sendEmail } from "@/app/services/server/remindersService"; // הנתיב שלך

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!email || !message) {
      return NextResponse.json(
        { error: "חסר מידע בטופס" },
        { status: 400 }
      );
    }

    // מייל שיגיע אלייך
    const adminEmail = process.env.MAIL_USER;

    const text = `
התקבלה פנייה חדשה מאתר GrouPay:

שם: ${name || "לא נמסר"}
אימייל: ${email}
נושא: ${subject || "ללא נושא"}

-----------------------
הודעה:
${message}
-----------------------
    `;

    // שליחה למייל שלך
    await sendEmail(adminEmail!, `פנייה חדשה מ-${email}: ${subject}`, text);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("CONTACT API ERROR:", err);
    return NextResponse.json(
      { error: "אירעה שגיאה בעת שליחת הפנייה" },
      { status: 500 }
    );
  }
}
