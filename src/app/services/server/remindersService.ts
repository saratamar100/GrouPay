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

const sendGroupDebtNotifications = async ({
  groups,
  users,
  subjectBuilder,
  messageBuilder,
}: {
  groups: any[];
  users: any[];
  subjectBuilder: (group: any) => string;
  messageBuilder: (group: any, member: any, debtsMessage: string) => string;
}) => {
  for (const group of groups) {
    const members = group.members || [];
    const groupDebts = group.group_debts || {};

    for (const userId in groupDebts) {
      const debts = groupDebts[userId];
      let debtsMessage = "";

      for (const debt of debts) {
        if (debt.amount < 0) {
          const payeeName =
            members.find((m: any) =>
              m.id.equals
                ? m.id.equals(debt.id)
                : m.id.toString() === debt.id.toString()
            )?.name || "לא ידוע";

          debtsMessage += `את/ה חייב/ת ${-debt.amount} ש"ח ל-${payeeName}\n`;
        }
      }

      if (debtsMessage === "") continue;
      const member = members.find((m: any) =>
        m.id.equals
          ? m.id.equals(userId)
          : m.id.toString() === userId.toString()
      );
      if (!member) continue;
      const email = users.find((u: any) => u._id.toString() === userId)?.email;
      if (!email) continue;

      const subject = subjectBuilder(group);
      const text = messageBuilder(group, member, debtsMessage);

      await sendEmail(email, subject, text);
    }
  }
};

export const monthlyReminder = async () => {
  const db = await getDb();

  const groups = await db
    .collection("group")
    .find({ notifications: true })
    .toArray();
  const users = await db.collection("user").find({}).toArray();

  await sendGroupDebtNotifications({
    groups,
    users,
    subjectBuilder: (group) => `תזכורת חודשית לקבוצה ${group.name}`,
    messageBuilder: (group, member, debtsMessage) =>
      `שלום ${member.name},\n\n` +
      `זוהי תזכורת חודשית עבור הקבוצה "${group.name}":\n\n` +
      `${debtsMessage}\n` +
      `אנא סגור/י את החובות שלך.\n\nבברכה,\nצוות GrouPay`,
  });
};

import { ObjectId } from "mongodb";

export const inactiveGroupReminder = async (groupId: string) => {
  const db = await getDb();

  const group = await db
    .collection("group")
    .findOne({ _id: new ObjectId(groupId) });

  if (!group) {
    console.error(`Group ${groupId} not found`);
    return;
  }

  const users = await db.collection("user").find({}).toArray();

  await sendGroupDebtNotifications({
    groups: [group],
    users,
    subjectBuilder: (group) => `הקבוצה ${group.name} אינה פעילה יותר`,
    messageBuilder: (group, member, debtsMessage) =>
      `שלום ${member.name},\n\n` +
      `הקבוצה "${group.name}" סומנה כלא פעילה אך עדיין יש לך חובות פתוחים:\n\n` +
      `${debtsMessage}\n` +
      `אנא טפל/י בחובות בהקדם.\n\nבברכה,\nצוות GrouPay`,
  });
};
