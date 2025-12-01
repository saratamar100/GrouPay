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
            console.log(debt.id)
            console.log(members[0])
          const payeeName =members.find((m: any) => m.id.equals( debt.id))?.name || "Unknown";
          message += `You need to pay ${-debt.amount} to ${payeeName}\n`;
        }
      }
      console.log({message});
      if (message !== "") {
        const member = members.find((m: any) => m.id.toString() === user);
        if (member) {
          const email = users.find((u:any) => u._id.toString() === user)?.email;
          const subject = `Monthly Reminder for Group ${group.name}`;
          const text = `Hello ${member.name},\n\nHere is your monthly reminder for group ${group.name}:\n\n${message}\nPlease settle your debts at your earliest convenience.\n\nBest regards,\nGroPay Team`;
          await sendEmail(email, subject, text);
          console.log(`Reminder sent to ${member.name} (${email})`);
        }
      }
    }
  }
};
