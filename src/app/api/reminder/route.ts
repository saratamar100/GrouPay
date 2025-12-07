import { monthlyReminder } from "@/app/services/server/remindersService";

export async function GET(req: Request) {
  // const authHeader = req.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', {
  //     status: 401,
  //   });
  // }
  await monthlyReminder();
  console.log("Monthly reminders triggered");
  return new Response("Monthly reminders triggered");
}
