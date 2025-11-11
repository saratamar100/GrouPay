import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }  
) {
  try {
  const { id } = await context.params;       
    const db = await getDb("groupay_db");
    const groups = db.collection("group");
    const users = db.collection("user");
    const transactions = db.collection("transaction");
    
    const group = await groups.findOne({ _id: new ObjectId(id) });
    if (!group) {
      return NextResponse.json({ error: "הקבוצה לא נמצאה" }, { status: 404 });
    }

    // Fetch members
    const memberIds = group.memberIds || [];
    let members: any[] = [];
    if (Array.isArray(memberIds) && memberIds.length > 0) {
      const objectIds = memberIds.map((u: string) =>
        ObjectId.isValid(u) ? new ObjectId(u) : u
      );
      members = await users
        .find(
          { _id: { $in: objectIds } },
          { projection: { _id: 1, name: 1, email: 1 } } 
        )
        .toArray();
    }

    // Fetch transactions
    const query = ObjectId.isValid(id)
      ? { $or: [{ groupId: new ObjectId(id) }, { groupId: id }] }
      : { groupId: id };
    const transactionsList = await transactions.find(query).toArray();
   
    return NextResponse.json(
      {
        group,
        members,
        actions: transactionsList,
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

