import { ObjectId } from "mongodb";
import { getDb } from "./mongo";
import { calculateTotalDebt } from "./debtsService";

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

  let finalSplit: SplitInput[];

  if (!split || split.length === 0) {
    const equalShare = amount / members.length;
    finalSplit = members.map((m) => ({
      userId: m.id,
      amount: equalShare,
    }));
  } else {
    const total = split.reduce(
      (sum: number, s: SplitInput) => sum + Number(s.amount || 0),
      0
    );

    if (Math.abs(total - amount) > 0.01) {
      const err = new Error("Split amounts do not sum up to the total amount");
      (err as any).status = 400;
      throw err;
    }

    finalSplit = split;
  }

  const db = await getDb("groupay_db");
  const expensesCol = db.collection("expense");
  const groupsCol = db.collection("group");

  const expenseDoc = {
    name: name.trim(),
    groupId: new ObjectId(groupId),
    amount,
    payer: new ObjectId(payer),
    split: finalSplit.map((s) => ({
      userId: new ObjectId(s.userId),
      amount: s.amount,
    })),
    date: new Date(),
    receiptUrl: receiptUrl ?? null,
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

  const expenseList = await expensesCol
    .find({ groupId: new ObjectId(groupId) })
    .toArray();

  const normalizedExpenses = expenseList.map((e: any) => {
    const payerId = e.payer?.toString?.() ?? e.payer;

    return {
      id: e._id.toString(),
      name: e.name,
      groupId: e.groupId.toString(),
      amount: e.amount,
      date: e.date,
      receiptUrl: e.receiptUrl ?? null,
      payer: payerId
        ? {
            id: payerId,
            name: memberMap.get(payerId),
          }
        : null,
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
    groupId: new ObjectId(groupId),
  });

  if (!expense) {
    const err = new Error("Expense not found in the specified group");
    (err as any).status = 404;
    throw err;
  }

  const payerId = expense.payer?.toString?.() ?? expense.payer;

  return {
    id: expense._id.toString(),
    name: expense.name,
    groupId: expense.groupId.toString(),
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
  groupId: string;
  expenseId: string;
  name?: string;
  amount?: number;
  payer?: string; 
  split?: SplitInput[];
  receiptUrl?: string | null;
  members?: MemberInput[]; 
}) {
  const { groupId, expenseId, name, amount, payer, split, receiptUrl, members } =
    params;

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
    payer === undefined &&
    split === undefined &&
    receiptUrl === undefined &&
    members === undefined
  ) {
    const err = new Error("No fields provided to update");
    (err as any).status = 400;
    throw err;
  }

  const db = await getDb("groupay_db");
  const expensesCol = db.collection("expense");

  const eid = new ObjectId(expenseId);
  const gid = new ObjectId(groupId);

  const current = await expensesCol.findOne({ _id: eid, groupId: gid });

  if (!current) {
    const err = new Error("Expense not found in the specified group");
    (err as any).status = 404;
    throw err;
  }

  const updateDoc: any = {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      const err = new Error("If provided, name must be a non-empty string");
      (err as any).status = 400;
      throw err;
    }
    updateDoc.name = name.trim();
  }

  if (amount !== undefined) {
    if (!Number.isFinite(amount) || amount <= 0) {
      const err = new Error("If provided, amount must be a positive number");
      (err as any).status = 400;
      throw err;
    }
    updateDoc.amount = amount;
  }

  if (payer !== undefined) {
    if (!ObjectId.isValid(payer)) {
      const err = new Error("Invalid payer id");
      (err as any).status = 400;
      throw err;
    }
    updateDoc.payer = new ObjectId(payer);
  }

  if (receiptUrl !== undefined) {
    if (receiptUrl !== null && typeof receiptUrl !== "string") {
      const err = new Error("receiptUrl must be a string or null");
      (err as any).status = 400;
      throw err;
    }
    updateDoc.receiptUrl = receiptUrl ?? null;
  }

  const effectiveAmount =
    updateDoc.amount !== undefined ? updateDoc.amount : current.amount;

  if (split !== undefined) {
    if (!Array.isArray(split)) {
      const err = new Error("If provided, split must be an array");
      (err as any).status = 400;
      throw err;
    }

    const normalizedSplit = split.map((s) => {
      if (!ObjectId.isValid(s.userId)) {
        const err = new Error("Each split item must contain a valid userId");
        (err as any).status = 400;
        throw err;
      }
      return {
        userId: new ObjectId(s.userId),
        amount: Number(s.amount || 0),
      };
    });

    const total = normalizedSplit.reduce(
      (sum, s) => sum + Number(s.amount || 0),
      0
    );

    if (Math.abs(total - Number(effectiveAmount)) > 0.01) {
      const err = new Error(
        "Split amounts do not sum up to the total amount"
      );
      (err as any).status = 400;
      throw err;
    }

    updateDoc.split = normalizedSplit;
  } else if (members !== undefined) {
    if (!Array.isArray(members) || members.length === 0) {
      const err = new Error(
        "Members must be a non-empty array when provided"
      );
      (err as any).status = 400;
      throw err;
    }

    const equalShare = Number(effectiveAmount) / members.length;

    updateDoc.split = members.map((m) => {
      if (!ObjectId.isValid(m.id)) {
        const err = new Error("Each member must have a valid id");
        (err as any).status = 400;
        throw err;
      }
      return {
        userId: new ObjectId(m.id),
        amount: equalShare,
      };
    });
  }

  const res = await expensesCol.updateOne(
    { _id: eid, groupId: gid },
    { $set: updateDoc }
  );

  if (res.matchedCount === 0) {
    const err = new Error("Expense not found in the specified group");
    (err as any).status = 404;
    throw err;
  }

  try {
    await calculateTotalDebt(groupId);
  } catch (err) {
    console.error("Failed to recalculate debts after expense update:", err);
  }

  return { ok: true };
}

export async function deleteExpense(groupId: string, expenseId: string) {
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

  const gid = new ObjectId(groupId);
  const eid = new ObjectId(expenseId);

  const db = await getDb("groupay_db");
  const groupsCol = db.collection("group");
  const expensesCol = db.collection("expense");

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
