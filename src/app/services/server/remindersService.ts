import { getDb } from "./mongo";
import nodemailer from "nodemailer";
import { ObjectId } from "mongodb";

export const sendEmail = async (to: string, subject: string, text: string) => {
  console.log(`[sendEmail] Preparing to send email to ${to} with subject: "${subject}"`);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  

  try {
    console.log(`[sendEmail] Verifying transporter...`);
    await transporter.verify();
    console.log(`[sendEmail] Transporter verified successfully.`);

    console.log(`[sendEmail] Sending email...`);
    const info = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject,
      text,
    });

    console.log(`[sendEmail] Email sent successfully! MessageId: ${info.messageId}`);
    console.log(`[sendEmail] Response: ${info.response}`);
  } catch (error: any) {
    console.error(`[sendEmail] Error sending email to ${to}:`, error?.message);
    console.error(error);
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
  console.log("=== Starting group debt notifications ===");
  console.log(`Total groups to process: ${groups.length}`);

  for (const group of groups) {
    console.log(`\nProcessing group: ${group.name} (id: ${group._id})`);
    const members = group.members || [];
    const groupDebts = group.group_debts || {};
    console.log(`Number of members in group: ${members.length}`);
    console.log(`Number of users with debts: ${Object.keys(groupDebts).length}`);

    for (const userId in groupDebts) {
      const debts = groupDebts[userId];
      console.log(`\nChecking debts for userId: ${userId}, number of debts: ${debts.length}`);
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
          console.log(`Debt found: ${-debt.amount} ILS to ${payeeName}`);
        }
      }

      if (debtsMessage === "") {
        console.log("No debts to notify for this user.");
        continue;
      }

      const member = members.find((m: any) =>
        m.id.equals
          ? m.id.equals(userId)
          : m.id.toString() === userId.toString()
      );

      if (!member) {
        console.log(`Member not found in group for userId: ${userId}`);
        continue;
      }

      const email = users.find((u: any) => u._id.toString() === userId)?.email;
      if (!email) {
        console.log(`Email not found for userId: ${userId}`);
        continue;
      }

      const subject = subjectBuilder(group);
      const text = messageBuilder(group, member, debtsMessage);

      console.log(`Sending email to ${member.name} (${email}) with subject: "${subject}"`);
      try {
        await sendEmail(email, subject, text);
        console.log(`Email successfully sent to ${email}`);
      } catch (err: any) {
        console.error(`Failed to send email to ${email}:`, err);
      }
    }
  }

  console.log("=== Finished group debt notifications ===");
};

export const monthlyReminder = async () => {
  console.log("=== Starting monthly reminder ===");
  let db;
  
  try{db = await getDb();}
  catch(err){
    console.error("Failed to connect to database:", err);
  }
  console.log("Connected to database");
  const groups = await db
    .collection("group")
    .find({ notifications: true })
    .toArray();
  console.log(`Groups with notifications enabled: ${groups.length}`);

  const users = await db.collection("user").find({}).toArray();
  console.log(`Total users found: ${users.length}`);

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

export const inactiveGroupReminder = async (groupId: string) => {
  console.log(`=== Starting inactive group reminder for groupId: ${groupId} ===`);
  const db = await getDb();

  const group = await db
    .collection("group")
    .findOne({ _id: new ObjectId(groupId) });

  if (!group) {
    console.error(`Group ${groupId} not found`);
    return;
  }
  console.log(`Processing inactive group: ${group.name}`);

  const users = await db.collection("user").find({}).toArray();
  console.log(`Total users found: ${users.length}`);

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
