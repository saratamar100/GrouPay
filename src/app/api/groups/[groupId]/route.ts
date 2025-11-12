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
    const expenses = db.collection("expense");

    const group = await groups.findOne(
      { _id: new ObjectId(groupId) },
      { projection: { actionIds: 1, name: 1, members: 1 } }
    );

    if (!group) {
      return NextResponse.json({ error: "הקבוצה לא נמצאה" }, { status: 404 });
    }

    let expensesList = [];
   if (Array.isArray(group.actionIds) && group.actionIds.length > 0) {
    const objectIds = group.actionIds.map((id: string) => new ObjectId(id));

  expensesList = await expenses
    .find(
      { _id: { $in: objectIds } },
      {
        projection: {
          groupId: 0,
        },
      }
    )
    .toArray();
}


    return NextResponse.json(
      {
        group: {
          id: group._id,
          name: group.name,
          members: group.members,
          expenses: expensesList,

        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching group data:", error);
    return NextResponse.json(
      { error: "שגיאה בשרת בעת שליפת נתוני הקבוצה" },
      { status: 500 }
    );
  }
}
