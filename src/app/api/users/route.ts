import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { User, UserId } from "@/app/types/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsQuery = searchParams.get("ids");

    if (!idsQuery) {
      return NextResponse.json({ error: "Missing user IDs" }, { status: 400 });
    }

    const userIds = idsQuery.split(",");

    const db = await getDb("groupay_db");
    const usersCollection = db.collection("user");

    const users = await usersCollection
      .find({ id: { $in: userIds } })
      .toArray();

    const usersMap = new Map<UserId, User>();
    users.forEach((user: any) => {
      const userId = user.id || user._id.toString();
      usersMap.set(userId, { ...user, id: userId });
    });

    const usersObject = Object.fromEntries(usersMap);

    return NextResponse.json(usersObject, { status: 200 });
  } catch (e) {
    console.error("GET Users Error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
