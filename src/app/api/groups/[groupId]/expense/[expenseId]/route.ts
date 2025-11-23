import { NextRequest, NextResponse } from "next/server";
import {
  getExpense,
  updateExpense,
  deleteExpense,
} from "@/app/services/server/expense";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ groupId: string; expenseId: string }> }
) {
  try {
    const { groupId, expenseId } = await context.params;

    if (!groupId || !expenseId) {
      return NextResponse.json(
        { error: "Missing group id or expense id" },
        { status: 400 }
      );
    }

    const expense = await getExpense(groupId, expenseId);

    return NextResponse.json({ expense }, { status: 200 });
  } catch (error: any) {
    const status = error?.status ?? 500;
    const message =
      error?.message ?? "Error fetching expense";

    console.error("Error fetching expense:", error);

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ groupId: string; expenseId: string }> }
) {
  try {
    const { groupId, expenseId } = await context.params;

    if (!groupId || !expenseId) {
      return NextResponse.json(
        { error: "Missing group id or expense id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    await updateExpense({
      groupId,
      expenseId,
      name: body.name,
      amount: body.amount,
      payer: body.payer,     
      split: body.split,      
      receiptUrl: body.receiptUrl,
      members: body.members,   
    });

    return NextResponse.json(
      { message: "Expense updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    const status = error?.status ?? 500;
    const message =
      error?.message ?? "Error updating expense";

    console.error("Error updating expense:", error);

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ groupId: string; expenseId: string }> }
) {
  try {
    const { groupId, expenseId } = await context.params;

    if (!groupId || !expenseId) {
      return NextResponse.json(
        { error: "Missing group id or expense id" },
        { status: 400 }
      );
    }

    await deleteExpense(groupId, expenseId);

    return NextResponse.json(
      { message: "Expense deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    const status = error?.status ?? 500;
    const message =
      error?.message ?? "Error deleting expense";

    console.error("Error deleting expense:", error);

    return NextResponse.json({ error: message }, { status });
  }
}
