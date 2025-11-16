// src/app/api/groups/[groupId]/expense/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await context.params;
    const body = await req.json();
    const { name, amount, payer, split, receiptUrl, members } = body;
    console.log("Received expense data:", body);

    if (!groupId || !ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: "Invalid or missing groupId" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Expense name is required and must be a string" },
        { status: 400 }
      );
    }

    if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }
    
    if (!payer || typeof payer !== "string" || payer.trim().length === 0) {
      return NextResponse.json(
        { error: "Payer is required and must be a non-empty string (payerId)" },
        { status: 400 }
      );
    }


    if (!members || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { error: "Members must be a non-empty array" },
        { status: 400 }
      );
    }

    if (split && !Array.isArray(split)) {
      return NextResponse.json(
        { error: "Split must be an array if provided" },
        { status: 400 }
      );
    }

    let finalSplit = split;
    if (!split || split.length === 0) {
      const equalShare = Number(amount) / members.length;
      finalSplit = members.map((m: any) => ({
        userId: typeof m === "string" ? m : m.id,
        amount: equalShare,
      }));
    } else {
      const total = split.reduce(
        (sum: number, s: any) => sum + Number(s.amount || 0),
        0
      );
      if (Math.abs(total - Number(amount)) > 0.01) {
        return NextResponse.json(
          { error: "Split amounts do not sum up to the total amount" },
          { status: 400 }
        );
      }
    }

    const db = await getDb("groupay_db");
    const expenses = db.collection("expense");

    const newExpense = {
      name: name.trim(),
      groupId: new ObjectId(groupId),
      amount: Number(amount),
      payer,
      split: finalSplit,
      date: new Date(),
      receiptUrl: receiptUrl || null,
    };

    const result = await expenses.insertOne(newExpense);

    const groups = db.collection("group");
    await groups.updateOne(
      { _id: new ObjectId(groupId) },
      { $push: { expenses: result.insertedId} }
    );

    return NextResponse.json(
      {
        message: "Expense created successfully",
        expenseId: result.insertedId,
        expense: newExpense,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Server error while creating expense" },
      { status: 500 }
    );
  }
}



export async function GET(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await context.params;
    if (!groupId || !ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: "Invalid or missing groupId" },
        { status: 400 }
      );
    }
    const db = await getDb("groupay_db");
    const expenses = db.collection("expense");
    const expenseList = await expenses
      .find({ groupId: new ObjectId(groupId) })
      .toArray();
    return NextResponse.json(expenseList, { status: 200 });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Server error while fetching expenses" },
      { status: 500 }
    );
  }   
}

