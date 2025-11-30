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
  { params }: { params: Promise<{ groupId: string; expenseId: string }> }
) {
  try {
    const { groupId, expenseId } = await params;

    const body = await req.json();
    const { userId, name, amount, split, receiptUrl } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    await updateExpense({
      userId,
      groupId,
      expenseId,
      name,
      amount,
      split,
      receiptUrl,
    });

    return NextResponse.json(
      { message: "Expense updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    const status = error?.status ?? 500;
    const message = error?.message ?? "Error updating expense";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string; expenseId: string }> }
) {
  try {
    const { groupId, expenseId } = await params;
    const { userId } = await req.json();

    if (!groupId || !expenseId || !userId) {
      return NextResponse.json(
        { error: "Missing group id or expense id or user id" },
        { status: 400 }
      );
    }

    await deleteExpense(groupId, expenseId, userId);

    return NextResponse.json(
      { ok: true, message: "Expense deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    const status = error?.status ?? 500;
    const message = error?.message ?? "Error deleting expense";

    console.error("Error deleting expense:", error);

    return NextResponse.json({ error: message }, { status });
  }
}
