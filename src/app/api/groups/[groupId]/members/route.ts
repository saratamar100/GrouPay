import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";




export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ groupId: string }> }  
) {
  try {
  const { groupId } = await context.params;       
    const db = await getDb("groupay_db");
    const groups = db.collection("group");
    const users = db.collection("user")
    
    const group = await groups.findOne({ _id: new ObjectId(groupId) });
    if (!group) {
      return NextResponse.json({ error: "הקבוצה לא נמצאה" }, { status: 404 });
    }
    const memberIds = group.memberIds;

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        {
          group,
          members: [],
        },
        { status: 200 }
      );
    }

    const objectIds = memberIds.map((u: string) =>
      ObjectId.isValid(u) ? new ObjectId(u) : u
    );

    const members = await users
      .find(
        { _id: { $in: objectIds } },
        { projection: { _id: 1, name: 1, email: 1 } } 
      )
      .toArray();

    return NextResponse.json(
      {
        groupId: groupId,
        members,
      },
      { status: 200 }
    );

  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "שגיאה בשרת" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { groupId, userId } = body;

    if (!groupId || !userId) {
      return NextResponse.json(
        { error: "groupId ו-userId דרושים" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const groupsCollection = db.collection("group");
    const usersCollection = db.collection("user");

    const group = await groupsCollection.findOne({ _id: new ObjectId(groupId) });
    if (!group) {
      return NextResponse.json({ error: "קבוצה לא נמצאה" }, { status: 404 });
    }

    if (group.members?.some((m: any) => m.id === userId)) {
      return NextResponse.json({ message: "המשתמש כבר חבר בקבוצה" });
    }

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }

    await groupsCollection.updateOne(
      { _id: new ObjectId(groupId) },
      { $push: { members: { id: userId, name: user.name } } }
    );

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $addToSet: { groupId: new ObjectId(groupId) },
      }
    );

    return NextResponse.json({ message: "חבר נוסף בהצלחה" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "שגיאה בשרת" },
      { status: 500 }
    );
  }
}
