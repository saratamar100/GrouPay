import { ObjectId } from "mongodb";
import { getDb } from "./mongo";

export const calculateTotalDebt = async (groupId: string) => {
  const db = await getDb("groupay_db");
  const payedAmounts: Record<string, number> = {};
  const owedAmounts: Record<string, number> = {};
  const expensesCollection = db.collection("expense");
  const expenses = await expensesCollection
    .find({ groupId: new ObjectId(groupId) })
    .toArray();

  for (const expense of expenses) {
    const payerId = expense.payer.id; //correct?
    payedAmounts[payerId] = (payedAmounts[payerId] || 0) + expense.amount;
    for (const splitDetail of expense.split) {
      const userId = splitDetail.userId;
      owedAmounts[userId] = (owedAmounts[userId] || 0) + splitDetail.amount;
    }
  }
  const paymentsCollection = db.collection("payment");
  const payments = await paymentsCollection
    .find({ groupId: groupId})
    .toArray();
    for (const payment of payments) {
    if (payment.status === "completed") {
      const payerId = payment.payer.id;
      const payeeId = payment.payee.id;
      payedAmounts[payerId] = (payedAmounts[payerId] || 0) + payment.amount;
      owedAmounts[payeeId] = (owedAmounts[payeeId] || 0) + payment.amount;
    }
    //to correct??
  }
  const totalDebt: Record<string, number> = {};
  const userIds = new Set<string>([
    ...Object.keys(payedAmounts),
    ...Object.keys(owedAmounts),
  ]);
  userIds.forEach((userId) => {
    const paid = payedAmounts[userId] || 0;
    const owed = owedAmounts[userId] || 0;
    totalDebt[userId] = owed - paid;
  });

  const debtors: { userId: string; amount: number }[] = [];
  const creditors: { userId: string; amount: number }[] = [];

  for (const [userId, amount] of Object.entries(totalDebt)) {
    if (amount > 0) debtors.push({ userId, amount });
    else if (amount < 0) creditors.push({ userId, amount: -amount });
  }

  // const settlements: { from: string; to: string; amount: number }[] = [];
  const debts: Record<string, { id: ObjectId; amount: number }[]> = {};

  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const payAmount = Math.min(debtor.amount, creditor.amount);
    // settlements.push({
    //   from: debtor.userId,
    //   to: creditor.userId,
    //   amount: payAmount,
    // });

    const from = debtor.userId;
    const to = creditor.userId;
    if (!debts[to]) debts[to] = [];
    debts[to].push({ id: new ObjectId(from), amount: payAmount });
    if (!debts[from]) debts[from] = [];
    debts[from].push({ id: new ObjectId(to), amount: -payAmount });

    debtor.amount -= payAmount;
    creditor.amount -= payAmount;

    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }
  const groupsCollection = db.collection("group");
  await groupsCollection.updateOne(
    { _id: new ObjectId(groupId) },
    { $set: { group_debts: debts } }
  );
  console.log({expenses, groupId})
};
