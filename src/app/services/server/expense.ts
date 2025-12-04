import { ObjectId } from "mongodb";
import { getDb } from "./mongo";
import { calculateTotalDebt } from "./debtsService";
import { round2 } from "@/app/utils/money";

type MemberInput = { id: string; name: string };
type SplitInput = { userId: string; amount: number };




export async function createExpense(params: {
  groupId: string;
  name: string;
  amount: number;
  payer: string;
  members: MemberInput[];
  split?: SplitInput[];
  receiptUrl?: string | null;
}) {
  const { groupId, name, amount, payer, members, split, receiptUrl } = params;

  if (!ObjectId.isValid(groupId)) {
    const err = new Error("Invalid groupId");
    (err as any).status = 400;
    throw err;
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    const err = new Error("Expense name is required and must be a string");
    (err as any).status = 400;
    throw err;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    const err = new Error("Amount must be a positive number");
    (err as any).status = 400;
    throw err;
  }

  if (!ObjectId.isValid(payer)) {
    const err = new Error("Invalid payer id");
    (err as any).status = 400;
    throw err;
  }

  if (!members || !Array.isArray(members) || members.length === 0) {
    const err = new Error("Members must be a non-empty array");
    (err as any).status = 400;
    throw err;
  }

  const memberMap = new Map<string, string>(
    members.map((m: any) => [m.id.toString(), m.name])
  );

  let finalSplit: SplitInput[];

  if (!split || split.length === 0) {
    const perHead = round2(amount / members.length);
    let remaining = amount;

    finalSplit = members.map((m, index) => {
      const share =
        index === members.length - 1 ? round2(remaining) : perHead;
      remaining = round2(remaining - share);

      return {
        userId: m.id,
        amount: share,
      };
    });
  } else {
    const roundedSplit: SplitInput[] = split.map((s) => ({
      userId: s.userId,
      amount: round2(Number(s.amount || 0)),
    }));

    const total = roundedSplit.reduce(
      (sum, s) => sum + s.amount,
      0
    );

    if (Math.abs(total - amount) > 0.01) {
      const err = new Error("Split amounts do not sum up to the total amount");
      (err as any).status = 400;
      throw err;
    }

    finalSplit = roundedSplit;
  }

  const db = await getDb("groupay_db");
  const expensesCol = db.collection("expense");
  const groupsCol = db.collection("group");

  const expenseDoc = {
    name: name.trim(),
    amount: round2(amount),
    payer: payer
      ? {
          id: new ObjectId(payer),
          name: memberMap.get(payer),
        }
      : null,
    split: finalSplit.map((s) => ({
      userId: new ObjectId(s.userId),
      amount: round2(s.amount),
    })),
    date: new Date(),
    receiptUrl: receiptUrl ?? null,
    groupId: new ObjectId(groupId),
  };

  const result = await expensesCol.insertOne(expenseDoc);

  await groupsCol.updateOne(
    { _id: new ObjectId(groupId) },
    { $push: { expenses: result.insertedId } }
  );

  try {
    await calculateTotalDebt(groupId);
  } catch (err) {
    console.error("Failed to recalculate debts after expense creation:", err);
  }

  return {
    id: result.insertedId.toString(),
    ...expenseDoc,
  };
}


export async function getGroupExpenses(groupId: string) {
  if (!ObjectId.isValid(groupId)) {
    const err = new Error("Invalid or missing groupId");
    (err as any).status = 400;
    throw err;
  }

  const db = await getDb("groupay_db");
  const expensesCol = db.collection("expense");
  const groupsCol = db.collection("group");

  const group = await groupsCol.findOne({ _id: new ObjectId(groupId) });

  if (!group) {
    const err = new Error("Group not found");
    (err as any).status = 404;
    throw err;
  }

  const members = group.members || [];
  const memberMap = new Map<string, string>(
    members.map((m: any) => [m.id.toString(), m.name])
  );

  const rawExpenseIds = Array.isArray(group.expenses) ? group.expenses : [];
  if (rawExpenseIds.length == 0) return [];

  const expenseList = await expensesCol
    .find({ _id: { $in: rawExpenseIds } })
    .toArray();

  const normalizedExpenses = expenseList.map((e: any) => {
    return {
      id: e._id.toString(),
      name: e.name,
      amount: e.amount,
      date: e.date,
      receiptUrl: e.receiptUrl ?? null,
      payer: e.payer,    
      split: (e.split || []).map((s: any) => {
        const userId = s.userId?.toString?.() ?? s.userId;

        return {
          id: userId,
          name: memberMap.get(userId),
          amount: s.amount,
        };
      }),
    };
  });

  return normalizedExpenses;
}
/*====================================== */
export async function getExpense(groupId: string, expenseId: string) {
  if (!ObjectId.isValid(groupId)) {
    const err = new Error("Invalid or missing groupId");
    (err as any).status = 400;
    throw err;
  }

  if (!ObjectId.isValid(expenseId)) {
    const err = new Error("Invalid or missing expenseId");
    (err as any).status = 400;
    throw err;
  }

  const db = await getDb("groupay_db");
  const expensesCol = db.collection("expense");
  const groupsCol = db.collection("group");

  const group = await groupsCol.findOne(
    { _id: new ObjectId(groupId) },
    { projection: { members: 1 } }
  );

  if (!group) {
    const err = new Error("Group not found");
    (err as any).status = 404;
    throw err;
  }

  const members = group.members || [];
  const memberMap = new Map<string, string>(
    members.map((m: any) => [m.id.toString(), m.name])
  );

  const expense = await expensesCol.findOne({
    _id: new ObjectId(expenseId),
  });

  if (!expense) {
    const err = new Error("Expense not found in the specified group");
    (err as any).status = 404;
    throw err;
  }

  const payerId = expense.payer;
  console.log(payerId)

  return {
    id: expense._id.toString(),
    name: expense.name,
    amount: expense.amount,
    date: expense.date,
    receiptUrl: expense.receiptUrl ?? null,
    payer: payerId
      ? {
          id: payerId,
          name: memberMap.get(payerId),
        }
      : null,
    split: (expense.split || []).map((s: any) => {
      const userId = s.userId?.toString?.() ?? s.userId;

      return {
        id: userId,
        name: memberMap.get(userId),
        amount: s.amount,
      };
    }),
  };
}

export async function updateExpense(params: {
  userId: string;
  groupId: string;
  expenseId: string;
  name?: string;
  amount?: number;
  split?: SplitInput[];
  receiptUrl?: string | null;
}) {
  const { userId, groupId, expenseId, name, amount, split, receiptUrl } = params;

  if (!ObjectId.isValid(groupId)) {
    const err = new Error("Invalid or missing groupId");
    (err as any).status = 400;
    throw err;
  }

  if (!ObjectId.isValid(expenseId)) {
    const err = new Error("Invalid or missing expenseId");
    (err as any).status = 400;
    throw err;
  }

  if (
    name === undefined &&
    amount === undefined &&
    split === undefined &&
    receiptUrl === undefined
  ) {
    const err = new Error("No fields provided to update");
    (err as any).status = 400;
    throw err;
  }

  const db = await getDb("groupay_db");
  const expensesCol = db.collection("expense");

  const eid = new ObjectId(expenseId);
  const current = await expensesCol.findOne({ _id: eid });

  if (!current) {
    const err = new Error("Expense not found in the specified group");
    (err as any).status = 404;
    throw err;
  }

  const payerId = current.payer?.id;

  if (!payerId || !ObjectId.isValid(payerId)) {
    const err = new Error("Invalid payer id");
    (err as any).status = 500;
    throw err;
  }

  if (!new ObjectId(payerId).equals(new ObjectId(userId))) {
    const err: any = new Error("You do not have permission");
    (err as any).status = 403;
    throw err;
  }

  const updateDoc: any = {};

  if (name !== undefined) {
    updateDoc.name = name.trim();
  }

  if (amount !== undefined) {
    updateDoc.amount = amount;
  }

  if (receiptUrl !== undefined) {
    updateDoc.receiptUrl = receiptUrl ?? null;
  }

  const effectiveAmount =
    updateDoc.amount !== undefined ? updateDoc.amount : current.amount;

  if (split !== undefined) {
    const normalizedSplit = split.map((s) => ({
      userId: new ObjectId(s.userId),
      amount: Number(s.amount || 0),
    }));

    const total = normalizedSplit.reduce(
      (sum, s) => sum + Number(s.amount || 0),
      0
    );

    if (Math.abs(total - Number(effectiveAmount)) > 0.01) {
      const err = new Error("Split amounts do not sum up to the total amount");
      (err as any).status = 400;
      throw err;
    }

    updateDoc.split = normalizedSplit;
  }

  const res = await expensesCol.updateOne({ _id: eid }, { $set: updateDoc });

  if (res.matchedCount === 0) {
    const err = new Error("Expense not found in the specified group");
    (err as any).status = 404;
    throw err;
  }

   try {
    await calculateTotalDebt(groupId);
  } catch (err) {
    console.error("Failed to recalculate debts after expense deletion:", err);
  }


  return { ok: true };
}

export async function deleteExpense(
  groupId: string,
  expenseId: string,
  userId: string
) {
  if (!ObjectId.isValid(groupId)) {
    const err = new Error("Invalid or missing groupId");
    (err as any).status = 400;
    throw err;
  }

  if (!ObjectId.isValid(expenseId)) {
    const err = new Error("Invalid or missing expenseId");
    (err as any).status = 400;
    throw err;
  }

  if (!ObjectId.isValid(userId)) {
    const err = new Error("Invalid or missing userId");
    (err as any).status = 400;
    throw err;
  }

  const gid = new ObjectId(groupId);
  const eid = new ObjectId(expenseId);
  const uid = new ObjectId(userId);

  const db = await getDb("groupay_db");
  const groupsCol = db.collection("group");
  const expensesCol = db.collection("expense");

  const expense = await expensesCol.findOne({ _id: eid });

  if (!expense) {
    const err = new Error("Expense not found");
    (err as any).status = 404;
    throw err;
  }

  const payerId = expense.payer.id;

  if (!payerId || !ObjectId.isValid(payerId)) {
    const err = new Error("Invalid payer id");
    (err as any).status = 500;
    throw err;
  }

  if (!new ObjectId(payerId).equals(uid)) {
    const err: any = new Error("You do not have permission");
    err.status = 403;
    throw err;
  }

  const group = await groupsCol.findOne(
    { _id: gid, expenses: eid },
    { projection: { _id: 1 } }
  );

  if (!group) {
    const err = new Error("Expense does not belong to the specified group");
    (err as any).status = 404;
    throw err;
  }

  const delRes = await expensesCol.deleteOne({ _id: eid });

  if (delRes.deletedCount === 0) {
    const err = new Error("Expense not found");
    (err as any).status = 404;
    throw err;
  }

  await groupsCol.updateOne({ _id: gid }, { $pull: { expenses: eid } });

  try {
    await calculateTotalDebt(groupId);
  } catch (err) {
    console.error("Failed to recalculate debts after expense deletion:", err);
  }

  return { ok: true };
}
