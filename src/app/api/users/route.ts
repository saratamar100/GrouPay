import { NextResponse } from "next/server";
import { getAllUsersFromDB } from "@/app/services/server/userService";

export async function GET() {
  try {
    const users = await getAllUsersFromDB();
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("API Error: Failed to fetch users:", error);
    return NextResponse.json({ message: "Server data error" }, { status: 500 });
  }
}
