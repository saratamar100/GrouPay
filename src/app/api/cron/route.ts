
import { sendEmail } from "@/app/services/server/remindersService";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    sendEmail("saratamar100@gmail.com", "Test Email", "This is a test email from the cron job.");
    return NextResponse.json({ message: "Cron job executed" });
}