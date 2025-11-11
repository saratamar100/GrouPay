import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";



export async function DELETE(req: NextRequest, context: { params: Promise<{ actionId: string }> }) {

  const params = await context.params;
  try {
    const { actionId } = params;
    if (!actionId) {
      return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
    }

    const db = await getDb("groupay_db");

    const transactions = db.collection("transaction");

    const deleteResult = await transactions.deleteOne(
      ObjectId.isValid(actionId) ? { _id: new ObjectId(actionId) } : { _id: actionId }
    );

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const groups = db.collection("group");
    const pullValues = ObjectId.isValid(actionId)
      ? { $in: [actionId, new ObjectId(actionId)] }
      : actionId;

    const updateResult = await groups.updateMany(
      { actionIds: ObjectId.isValid(actionId) ? { $in: [actionId, new ObjectId(actionId)] } : actionId },
      { $pull: { actionIds: pullValues } }
    );

    return NextResponse.json(
      {
        message: "Transaction deleted",
        groupsUpdated: updateResult.modifiedCount,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}



export async function PUT(req: NextRequest, context: { params: Promise<{ actionId: string }> }) {
  try {
    const { actionId } = await context.params;
    console.log("Transaction ID:", actionId);
    if (!actionId) return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });  
    const body = await req.json();
    const db = await getDb("groupay_db");
    const transactions = db.collection("transaction");
    const updateDoc: any = {};
    for (const key of ["name", "type", "amount", "payerId", "split", "date", "receiptUrl"]) {
      if (body[key] !== undefined) {
        updateDoc[key] = key === "amount" ? Number(body[key]) : body[key];
      }
    }
    if (Object.keys(updateDoc).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    console.log("Update Document:", updateDoc);
    const result = await transactions.updateOne(
      ObjectId.isValid(actionId) ? { _id: new ObjectId(actionId) } : { _id: actionId },
      { $set: updateDoc }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Transaction updated" }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**exemple for put data
 * {
  "name": "Updated Transaction Name",
  "type": "expense",
  "amount": 150.75,
}
 */
