import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";

function isValidPayer(payer: any): boolean {
  return payer && typeof payer === "object"
    && typeof payer.id === "string"
    && typeof payer.name === "string";
}
function isNonEmptyArray(a: any): boolean {
  return Array.isArray(a) && a.length > 0;
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ groupId: string; expenseId: string }> }
) {
  try {
    const { groupId, expenseId } = await context.params;

    if (!groupId || !ObjectId.isValid(groupId)) {
      return NextResponse.json({ error: "Invalid or missing groupId" }, { status: 400 });
    }
    if (!expenseId || !ObjectId.isValid(expenseId)) {
      return NextResponse.json({ error: "Invalid or missing expenseId" }, { status: 400 });
    }

    const body = await req.json();
    const { name, amount, payer, split, receiptUrl, members } = body ?? {};
    

    if(body.length === 0) {
      return NextResponse.json({ error: "Request body cannot be empty" }, { status: 400 });
    }

    const db = await getDb("groupay_db");
    const expenses = db.collection("expense");

   

    const current = await expenses.findOne({ _id: new ObjectId(expenseId) });
    if (!current) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    const updateDoc: any = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "If provided, name must be a non-empty string" }, { status: 400 });
      }
      updateDoc.name = name.trim();
    }

    if (amount !== undefined) {
      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        return NextResponse.json({ error: "If provided, amount must be a positive number" }, { status: 400 });
      }
      updateDoc.amount = Number(amount);
    }

    if (payer !== undefined) {
      if (!isValidPayer(payer)) {
        return NextResponse.json(
          { error: "If provided, payer must be an object with 'id' (string) and 'name' (string)" },
          { status: 400 }
        );
      }
      updateDoc.payer = payer;
    }

    if (receiptUrl !== undefined) {
      if (receiptUrl !== null && typeof receiptUrl !== "string") {
        return NextResponse.json({ error: "receiptUrl must be a string or null" }, { status: 400 });
      }
      updateDoc.receiptUrl = receiptUrl ?? null;
    }

    const effectiveAmount = updateDoc.amount ?? current.amount;

    if (split !== undefined) {
      if (!Array.isArray(split)) {
        return NextResponse.json({ error: "If provided, split must be an array" }, { status: 400 });
      }
      const total = split.reduce((sum: number, s: any) => sum + Number(s.amount || 0), 0);
      if (Math.abs(total - Number(effectiveAmount)) > 0.01) {
        return NextResponse.json(
          { error: "Split amounts do not sum up to the total amount" },
          { status: 400 }
        );
      }
      updateDoc.split = split;
    } else if (members !== undefined) {
      if (!isNonEmptyArray(members)) {
        return NextResponse.json({ error: "Members must be a non-empty array when provided" }, { status: 400 });
      }
      const equalShare = Number(effectiveAmount) / members.length;
      updateDoc.split = members.map((m: any) => ({
        userId: typeof m === "string" ? m : m.id,
        amount: equalShare,
      }));
    }

    if (Object.keys(updateDoc).length === 0) {
      return NextResponse.json({ error: "No valid fields provided to update" }, { status: 400 });
    }

    const res = await expenses.updateOne(
      { _id: new ObjectId(expenseId) },
      { $set: updateDoc }
    );


    return NextResponse.json({ message: "Expense updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json({ error: "Server error while updating expense" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ groupId: string; expenseId: string }> }
) {
  try {
    const { groupId, expenseId } = await context.params;

    if (!groupId || !ObjectId.isValid(groupId)) {
      return NextResponse.json({ error: "Invalid or missing groupId" }, { status: 400 });
    }
    if (!expenseId || !ObjectId.isValid(expenseId)) {
      return NextResponse.json({ error: "Invalid or missing expenseId" }, { status: 400 });
    }

    const db = await getDb("groupay_db");
    const groups = db.collection("group");
    const expenses = db.collection("expense");

    const group = await groups.findOne(
      { _id: new ObjectId(groupId), expenses: { $in: [expenseId] } },
      { projection: { _id: 1 } }
    );
    if (!group) {
      return NextResponse.json({ error: "Expense does not belong to the specified group" }, { status: 404 });
    }

    const delRes = await expenses.deleteOne({ _id: new ObjectId(expenseId) });
    if (delRes.deletedCount === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    await groups.updateOne(
      { _id: new ObjectId(groupId) },
      { $pull: { expenses: expenseId } }
    );

    return NextResponse.json({ message: "Expense deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json({ error: "Server error while deleting expense" }, { status: 500 });
  }
}
