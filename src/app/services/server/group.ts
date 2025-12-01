import { ObjectId } from "mongodb";
import { getDb } from "./mongo";

export async function getGroupWithExpensesService(groupId: string, userId: string) {
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
    { projection: { name: 1, members: 1, expenses: 1 } }
  );

  if (!group) {
    const err = new Error("הקבוצה לא נמצאה");
    (err as any).status = 404;
    throw err;
  }

  const members = Array.isArray(group.members) ? group.members : [];
  console.log("members:", group.members);
  console.log("userId:", userId);

  const isMember = members.some((m: any) => {
    const memberId = m.userId ?? m.id ?? m._id;
    if (!memberId) return false;
    return memberId.toString() === userId;
  });

  if (!isMember) {
    const err: any = new Error("You do not have permission");
    (err as any).status = 403;
    throw err;
  }

  const memberMap = new Map<string, string>(
    members.map((m: any) => [m.id.toString(), m.name])
  );

  const expenseIdValues = Array.isArray(group.expenses) ? group.expenses : [];

  const expenseObjectIds: ObjectId[] = expenseIdValues
    .map((id: any) => {
      if (id instanceof ObjectId) return id;
      if (typeof id === "string" && ObjectId.isValid(id)) return new ObjectId(id);
      return null;
    })
    .filter((id: ObjectId | null): id is ObjectId => id !== null);

  let expensesList: any[] = [];

  if (expenseObjectIds.length > 0) {
    const rawExpenses = await expensesCol
      .find({ _id: { $in: expenseObjectIds } }, { projection: { groupId: 0 } })
      .toArray();

    expensesList = rawExpenses.map((e: any) => {
      const payerId = e.payer?.toString?.() ?? e.payer;

      return {
        id: e._id.toString(),
        name: e.name ?? "",
        amount: typeof e.amount === "number" ? e.amount : Number(e.amount ?? 0),
        date: e.date ?? null,
        receiptUrl: e.receiptUrl ?? null,

        payer: payerId
          ? {
              id: payerId,
              name: memberMap.get(payerId),
            }
          : null,

        split: Array.isArray(e.split)
          ? e.split.map((s: any) => {
              const splitUserId = s.userId?.toString?.() ?? s.userId;

              return {
                id: splitUserId,
                name: memberMap.get(splitUserId),
                amount: s.amount,
              };
            })
          : [],
      };
    });
  }

  return {
    id: group._id.toString(),
    name: group.name ?? "",
    members: members,
    expenses: expensesList,
  };
}
