import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
   const { id } = await params;  

    if (!id) {
      return NextResponse.json(
        { error: "Missing group ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, type, amount, payerId, split, date, receiptUrl } = body;

    if (!name || !type || !amount || !payerId || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb("groupay_db");

    const groups = db.collection("group");
    const transactions = db.collection("transaction");

    const groupObjId = new ObjectId(id);

    const group = await groups.findOne({ _id: groupObjId });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    // Create transaction
    const newTransaction = {
      groupId: groupObjId,
      name,
      type,
      amount,
      payerId,
      split: split || [],
      date: new Date(date),
      receiptUrl: receiptUrl || null,
    };

    const insertResult = await transactions.insertOne(newTransaction);

    // push ID into group's actionIds
    await groups.updateOne(
      { _id: groupObjId },
      {
        $push: {
          actionIds: insertResult.insertedId.toString(),
        },
      }
    );

    return NextResponse.json(
      {
        message: "Transaction created successfully",
        id: insertResult.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}


export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
   const { id } = await params;  
   console.log("Fetching transactions for group ID:", id);
    const db = await getDb("groupay_db");
    const groups = db.collection("group");
    const transactions = db.collection("transaction")
    
    const group = await groups.findOne({ _id: new ObjectId(id) });
    if (!group) {
      return NextResponse.json({ error: "הקבוצה לא נמצאה" }, { status: 404 });
    }

    const actionIds = group.actionIds;

    if (!Array.isArray(actionIds) || actionIds.length === 0) {
      return NextResponse.json(
        {
          group,
          actions: [], 
        },
        { status: 200 }
      );
    }

    const objectIds = actionIds.map((idStr: string) => new ObjectId(idStr));

    const actions = await transactions
      .find({ _id: { $in: objectIds } })
      .toArray();

    return NextResponse.json(
      {
        actions,
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
