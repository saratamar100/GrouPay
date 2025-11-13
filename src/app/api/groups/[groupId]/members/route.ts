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
