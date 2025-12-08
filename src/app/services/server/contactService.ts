import { sendEmail } from "./remindersService";

export async function sendContact(params: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const { name, email, subject, message } = params;

  if (!email || !name || !message) {
    return {
      status: 400,
      body: { error: "חסר מידע בטופס" },
    };
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

  await sendEmail(
    adminEmail!,
    `פנייה חדשה מ-${name}: ${subject || ""}`,
    text
  );

  return {
    status: 200,
    body: { success: true },
  };
}
