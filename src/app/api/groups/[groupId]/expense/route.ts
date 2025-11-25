import { NextRequest, NextResponse } from "next/server";
import { createExpense,getGroupExpenses } from "@/app/services/server/expense";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await context.params;
    const body = await req.json();
    const { name, amount, payer, split, receiptUrl, members } = body;
    const expense = await createExpense({
      groupId,
      name,
      amount,
      payer,
      members,
      split,
      receiptUrl,
    });

    return NextResponse.json(
      {
        message: "Expense created successfully",
        expenseId: expense.id,
        expense,
      },
      { status: 201 }
    );
   
    
  } catch (error:any) {

    const status = error?.status ?? 500;
    const message =
      error?.message ?? "Server error while creating expense";

    console.error("Error creating expense:", error);

    return NextResponse.json({ error: message }, { status });
    
  }
}



export async function GET(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await context.params;
    const expenses = await getGroupExpenses(groupId)

    return NextResponse.json(expenses, { status: 200 });
  } catch (error: any) {
    const status = error?.status ?? 500;
    const message =
      error?.status === 404
        ? "Group not found"
        : error?.message ?? "Server error while fetching expenses";

    console.error("Error fetching expenses:", error);

    return NextResponse.json({ error: message }, { status });
  }
}

