import { getDb } from "./mongo";
import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}`);
  } catch (error: any) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

export const monthlyReminder = async () => {
  const db = await getDb();

  const groupDocs = await db
    .collection("group")
    .find({ notifications: true })
    .toArray();

  const users = await db
    .collection("user")
    .find({})
    .toArray();

  for (const group of groupDocs) {
    const members = group.members || [];
    const groupDebts = group.group_debts || {};

    for (const user in groupDebts) {
      const debts = groupDebts[user];
      let message = "";

      for (const debt of debts) {
        if (debt.amount < 0) {
          const payeeName =
            members.find((m: any) =>
              m.id.equals ? m.id.equals(debt.id) : m.id.toString() === debt.id.toString()
            )?.name || "לא ידוע";
          message += `את/ה חייב/ת ${-debt.amount} ש"ח ל-${payeeName}\n`;
        }
      }

      if (message !== "") {
        const member = members.find((m: any) =>
          m.id.equals ? m.id.equals(user) : m.id.toString() === user
        );
        if (member) {
          const email = users.find((u: any) => u._id.toString() === user)?.email;
          if (email) {
            const subject = `תזכורת חודשית לקבוצה ${group.name}`;
            const text = `שלום ${member.name},\n\nזוהי תזכורת חודשית עבור הקבוצה ${group.name}:\n\n${message}\nאנא סגור את החובות שלך בהקדם האפשרי.\n\nבברכה,\nצוות GrouPay`;
            await sendEmail(email, subject, text);
            console.log(`Reminder sent to ${member.name} (${email})`);
          }
        }
      }
    }
  }
};
