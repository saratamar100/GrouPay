// app/api/groups/removeMember/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";

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

    // בדיקה אם הקבוצה קיימת
    const group = await groupsCollection.findOne({ _id: new ObjectId(groupId) });
    if (!group) {
      return NextResponse.json({ error: "קבוצה לא נמצאה" }, { status: 404 });
    }

    // בדיקה אם המשתמש בכלל חבר בקבוצה
    if (!group.members?.some((m: any) => m.id === userId)) {
      return NextResponse.json({ message: "המשתמש לא חבר בקבוצה" });
    }

    // הסרת המשתמש
    await groupsCollection.updateOne(
      { _id: new ObjectId(groupId) },
      { $pull: { members: { id: userId } } }
    );

    return NextResponse.json({ message: "חבר הוסר בהצלחה" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
