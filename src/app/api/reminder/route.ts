import { monthlyReminder } from "@/app/services/server/remindersService";

export async function GET(req: Request) {
  // const url = new URL(req.url);
  // const secret = url.searchParams.get("secret");

  // if (secret !== process.env.CRON_SECRET) {
  //   return new Response(JSON.stringify({ error: "Unauthorized" }), {
  //     status: 401,
  //   });
  // }
  monthlyReminder();
  console.log("Monthly reminders triggered");
  return new Response("Monthly reminders triggered");
}
