import { NextResponse } from "next/server";
import { sendEmail } from "@/app/services/server/remindersService"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!email || !message ||!name) {
      return NextResponse.json(
        { error: "חסר מידע בטופס" },
        { status: 400 }
      );
    }

    const adminEmail = process.env.MAIL_USER;

    const text = `
התקבלה פנייה חדשה מאתר GrouPay:

שם: ${name}
אימייל: ${email}
נושא: ${subject || "ללא נושא"}

-----------------------
הודעה:
${message}
-----------------------
    `;

    await sendEmail(adminEmail!, `פנייה חדשה מ-${name}: ${subject}`, text);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("CONTACT API ERROR:", err);
    return NextResponse.json(
      { error: "אירעה שגיאה בעת שליחת הפנייה" },
      { status: 500 }
    );
  }
}
