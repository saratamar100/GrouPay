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
  data: {
    name?: string;
    amount?: number;
    split?: { userId: string; amount: number }[];
    receiptUrl?: string | null;
  }
) {
  const res = await fetch(`/api/groups/${groupId}/expense/${expenseId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update expense");
  }

  return res.json();
}

interface GroupCreationPayload {
  name: string;
  memberIds: string[];
}
export async function createGroup(
  payload: GroupCreationPayload
): Promise<Group> {
  const res = await fetch("/api/groups", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Unknown API error" }));
    throw new Error(
      `Failed to create group: ${errorData.message || res.statusText}`
    );
  }

  const data: Group = await res.json();
  return data;
}
