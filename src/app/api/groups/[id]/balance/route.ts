import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";
import { Debt, Member } from "@/app/types/types";

async function getCurrentUserId(): Promise<string> {
  return "69109ab9cb8aa2c1b27a7998";
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const groupId = params.id;

    const currentUserId = await getCurrentUserId();

    if (!ObjectId.isValid(groupId) || !ObjectId.isValid(currentUserId)) {
      return NextResponse.json(
        { error: "Invalid Group or User ID format" },
        { status: 400 }
      );
    }

    const db = await getDb("groupay_db");
    const groupsCollection = db.collection("group");

    const group = await groupsCollection.findOne({
      _id: new ObjectId(groupId),
    });
    if (!group || !group.group_debts) {
      return NextResponse.json(
        { error: "Group or debts not found" },
        { status: 404 }
      );
    }

    const myDebtsEntry = group.group_debts.find((d: any) =>
      d.id.equals(new ObjectId(currentUserId))
    );

    if (!myDebtsEntry || !myDebtsEntry.debts) {
      return NextResponse.json([], { status: 200 });
    }

    const otherUserObjectIds = myDebtsEntry.debts.map((d: any) => d.id);
    if (otherUserObjectIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }
    const usersCollection = db.collection("user");
    const otherUsers = await usersCollection
      .find({ _id: { $in: otherUserObjectIds } })
      .toArray();

    const userMap = new Map<string, string>();
    otherUsers.forEach((user: any) => {
      userMap.set(user._id.toString(), user.name);
    });

    const finalDebts: Debt[] = myDebtsEntry.debts
      .map((debt: any) => {
        const memberIdString = debt.id.toString();
        const memberName = userMap.get(memberIdString) || "משתמש לא ידוע";

        return {
          member: {
            id: memberIdString,
            name: memberName,
          },
          amount: Number(debt.amount),
        };
      })
      .filter((d: Debt) => d.amount !== 0);

    return NextResponse.json(finalDebts, { status: 200 });
  } catch (e) {
    console.error("GET Group Balance Error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
