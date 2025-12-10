import { ObjectId } from "mongodb";
import { getDb } from "@/app/services/server/mongo";
import { inactiveGroupReminder } from "@/app/services/server/remindersService";

export async function getGroupWithExpensesService(
  groupId: string,
  userId: string
) {
  if (!groupId || !ObjectId.isValid(groupId)) {
    const err = new Error("groupId לא חוקי");
    (err as any).status = 400;
    throw err;
  }

  const db = await getDb("groupay_db");
  const groups = db.collection("group");
  const expensesCol = db.collection("expense");

  const group = await groups.findOne(
    { _id: new ObjectId(groupId) },
    { projection: { name: 1, members: 1, expenses: 1, isActive: 1, budget: 1 } }
  );

  if (!group) {
    const err = new Error("הקבוצה לא נמצאה");
    (err as any).status = 404;
    throw err;
  }

  const members = Array.isArray(group.members) ? group.members : [];

  const isMember = members.some((m: any) => {
    const memberId = m.userId ?? m.id ?? m._id;
    if (!memberId) return false;
    return memberId.toString() === userId;
  });

  if (!isMember) {
    const err: any = new Error("You do not have permission");
    err.status = 403;
    throw err;
  }

  const memberMap = new Map<string, string>(
    members
      .map((m: any) => {
        const id = (m.userId ?? m.id ?? m._id)?.toString?.();
        if (!id) return null;
        return [id, m.name] as [string, string];
      })
      .filter(Boolean) as [string, string][]
  );

  const expenseIdValues = Array.isArray(group.expenses) ? group.expenses : [];

  const expenseObjectIds: ObjectId[] = expenseIdValues
    .map((id: any) => {
      if (id instanceof ObjectId) return id;
      if (typeof id === "string" && ObjectId.isValid(id))
        return new ObjectId(id);
      return null;
    })
    .filter((id: ObjectId | null): id is ObjectId => id !== null);

  let expensesList: any[] = [];

  if (expenseObjectIds.length > 0) {
    const rawExpenses = await expensesCol
      .find({ _id: { $in: expenseObjectIds } }, { projection: { groupId: 0 } })
      .toArray();

    expensesList = rawExpenses.map((e: any) => {
      const rawPayer = e.payer ?? null;

      let payer: { id: string; name: string } | null = null;

      if (rawPayer && rawPayer.id) {
        const payerId = rawPayer.id?.toString?.() ?? String(rawPayer.id ?? "");
        const payerNameFromMembers = payerId
          ? memberMap.get(payerId)
          : undefined;

        payer = {
          id: payerId,
          name: rawPayer.name ?? payerNameFromMembers ?? "",
        };
      }

      const split = Array.isArray(e.split)
        ? e.split.map((s: any) => {
            const rawSplitId = s.userId ?? s.id ?? s._id;
            const splitId = rawSplitId?.toString?.();
            const splitMemberName = splitId
              ? memberMap.get(splitId)
              : undefined;

            return {
              id: splitId,
              name: splitMemberName ?? "",
              amount: s.amount,
            };
          })
        : [];

      return {
        id: e._id.toString(),
        name: e.name ?? "",
        amount: typeof e.amount === "number" ? e.amount : Number(e.amount ?? 0),
        date: e.date ?? null,
        receiptUrl: e.receiptUrl ?? null,
        payer,
        split,
      };
    });
  }

  return {
    id: group._id.toString(),
    name: group.name ?? "",
    members,
    expenses: expensesList,
    isActive: group.isActive,
    budget: typeof group.budget === "number" ? group.budget : undefined,
  };
}
