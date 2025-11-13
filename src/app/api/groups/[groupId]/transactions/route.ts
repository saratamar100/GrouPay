import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";

export async function GET(_req: NextRequest, context: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId: id } = await context.params;
    if (!id) return NextResponse.json({ error: "Missing group ID" }, { status: 400 });

    const db = await getDb("groupay_db");
    const transactions = db.collection("transactions");

    const query = ObjectId.isValid(id)
      ? { $or: [{ groupId: new ObjectId(id) }, { groupId: id }] }
      : { groupId: id };

    const list = await transactions.find(query).toArray();
    return NextResponse.json({ actions: list }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId: id } = await context.params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Missing/invalid group ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name, type, amount, payerId, split = [], date, receiptUrl = null } = body ?? {};

    if (!name || !type || amount == null || !payerId || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDb("groupay_db");
    const groups = db.collection("group");
    const transactions = db.collection("transactions");

    // Ensure group exists
    const group = await groups.findOne({ _id: new ObjectId(id) });
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Create the transaction document
    const doc = {
      groupId: new ObjectId(id),
      name: String(name),
      type: String(type),
      amount: Number(amount),
      payerId: String(payerId),
      split: Array.isArray(split) ? split : [],
      date: new Date(date),
      receiptUrl,
    };

    // Insert transaction
    const { insertedId } = await transactions.insertOne(doc);

    await groups.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          actionIds: insertedId.toString(),
        },
      }
    );

    return NextResponse.json(
      {
        message: "Transaction created",
        id: insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

