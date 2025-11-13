import type { Group, Expense, Member } from "@/app/types/types";
import { ObjectId } from "mongodb";

export async function getGroup(groupId: string): Promise<Group> {
    const res = await fetch(`/api/groups/${groupId}`);
    if (!res.ok) {
        throw new Error("Failed to fetch group");
    }
    return res.json();
}

export async function getGroupExpenses(groupId: string): Promise<Expense[]> {
    const res = await fetch(`/api/groups/${groupId}/expense`);
    if (!res.ok) {
        throw new Error("Failed to fetch group expenses");
    }
    return res.json();
}


export async function createExpense(
  groupId: string,
  members: Member[],
  expenseData: Omit<Expense, "id" | "payer"> & { payer: string }
): Promise<Expense> {

  console.log("Creating expense with data:", expenseData);

  const res = await fetch(`/api/groups/${groupId}/expense`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...expenseData,
        members,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to create expense");
  }

  return res.json();
}


export async function delExpense(
    groupId: string,
    expenseId: string
): Promise<{ success: boolean }> {
    const res = await fetch(`/api/groups/${groupId}/expense/${expenseId}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        throw new Error("Failed to delete expense");
    }
    return res.json();
}


export async function updateExpense(
    groupId: string,
    expenseId: string,
    expenseData: Partial<Omit<Expense, "id" | "date" | "receiptUrl">>
): Promise<Expense> {
    const res = await fetch(`/api/groups/${groupId}/expense/${expenseId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
    });
    if (!res.ok) {
        throw new Error("Failed to update expense");
    }
    return res.json();
}   