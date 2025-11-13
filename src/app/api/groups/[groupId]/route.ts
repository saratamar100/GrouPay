import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await context.params;

    if (!groupId || !ObjectId.isValid(groupId)) {
      return NextResponse.json({ error: "groupId לא חוקי" }, { status: 400 });
    }

    const db = await getDb("groupay_db");
    const groups = db.collection("group");
    const expensesCol = db.collection("expense");

    const group = await groups.findOne(
      { _id: new ObjectId(groupId) },
      { projection: { name: 1, members: 1, expenses: 1 } }
    );

    if (!group) {
      return NextResponse.json({ error: "הקבוצה לא נמצאה" }, { status: 404 });
    }

    const expenseIdValues = Array.isArray(group.expenses) ? group.expenses : [];
    const expenseObjectIds: ObjectId[] = expenseIdValues
      .map((id: any) => {
        if (id instanceof ObjectId) return id;
        if (typeof id === "string" && ObjectId.isValid(id)) return new ObjectId(id);
        return null;
      })
      .filter((id: ObjectId | null): id is ObjectId => id !== null);
    let expensesList: any[] = [];
    if (expenseObjectIds.length > 0) {
      expensesList = await expensesCol
        .find(
          { _id: { $in: expenseObjectIds } },
          { projection: { groupId: 0 } }
        )
        .toArray();

      expensesList = expensesList.map((e) => ({
        id: e._id.toString(),
        name: e.name ?? "",
        amount: typeof e.amount === "number" ? e.amount : Number(e.amount ?? 0),
        payer: e.payer ?? null,
        split: Array.isArray(e.split) ? e.split : [],
        date: e.date ?? null,
        receiptUrl: e.receiptUrl ?? null,
      }));
    }

    return NextResponse.json(
      {
        id: group._id.toString(),
        name: group.name ?? "",
        members: Array.isArray(group.members) ? group.members : [],
        expenses: expensesList,
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
