import { NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const db = await getDb();

    const userObjectId = new ObjectId(userId);

    const user = await db.collection("user").findOne({ _id: userObjectId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!Array.isArray(user.groupId)) {
      return NextResponse.json({ error: "Invalid user.groupId format" }, { status: 500 });
    }

    const groupObjectIds = user.groupId.map((id: string) => new ObjectId(id));

    const groups = await db.collection("group").find({ _id: { $in: groupObjectIds } }).toArray();

    const result = groups
      .map((group: any, index: number) => {

        if (!Array.isArray(group.group_debts)) {
          return null;
        }

        const userDebt = group.group_debts.find((entry: any) =>
          String(entry.id) === userId
        );

        if (!userDebt) {
          return null;
        }

        if (!Array.isArray(userDebt.debts)) {
          return null;
        }

        const balance = userDebt.debts.reduce((sum: number, d: any) => {
          return sum + (d.amount || 0);
        }, 0);


        return {
          groupId: group._id,
          groupName: group.name,
          balance,
        };
      })
      .filter(Boolean);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
