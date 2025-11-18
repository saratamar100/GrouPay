import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await context.params;

    if (!groupId || !ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: "Invalid or missing groupId" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { userId, name } = body ?? {};

    if (!userId || typeof userId !== "string" || !name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Missing user data" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid userId" },
        { status: 400 }
      );
    }

    const userObjectId = new ObjectId(userId);
    const groupObjectId = new ObjectId(groupId);

    const db = await getDb("groupay_db");
    const groups = db.collection("group");
    const users = db.collection("user");

    const userInDb = await users.findOne({ _id: userObjectId });
    if (!userInDb) {
      return NextResponse.json(
        { error: "User does not exist in system" },
        { status: 400 }
      );
    }

    const group = await groups.findOne(
      { _id: groupObjectId },
      { projection: { members: 1 } }
    );
    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    const alreadyMember = (group.members || []).some(
        (m: any) => (m.id as ObjectId).equals(userObjectId)
    );

    if (alreadyMember) {
      return NextResponse.json(
        { ok: true, message: "Already member" },
        { status: 200 }
      );
    }

    await groups.updateOne(
      { _id: groupObjectId },
      {
        $push: {
          members: { id: userId, name }
        }
      }
    );

    await users.updateOne(
      { _id: userObjectId },
      {
        $addToSet: {
          groupId: groupObjectId 
        }
      }
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Join error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
