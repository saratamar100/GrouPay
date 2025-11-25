import { ObjectId } from "mongodb";
import { getDb } from "./mongo";

export async function fetchPendingPaymentsForGroup(
  groupId: string,
  userId: string
) {
  const db = await getDb("groupay_db"); 
  const groupsCollection = db.collection("group");
  const group = await groupsCollection.findOne({ _id: new ObjectId(groupId) });
  if (!group || !group.payments) return [];

  const paymentsIds = group.payments;
  const paymentsCollection = db.collection("payment");
  const payments = await paymentsCollection
    .find({
      _id: { $in: paymentsIds },//change to groupId?
      status: "pending",
      $or: [
        { payer: new ObjectId(userId) },
        { payee: new ObjectId(userId) }
      ],
    })
    .toArray();
  return payments;
}

interface PaymentInput {
  payeeId: string;
  payerId: string;
  amount: number;
  groupId: string;
}

interface PaymentResult {
  success: boolean;
  payment?: any;
}

export async function createPayment(
  input: PaymentInput
): Promise<PaymentResult> {
  const { payeeId, payerId, amount, groupId } = input;

  if (!payeeId || !payerId || !amount || !groupId) {
    return { success: false };
  }

  const db = await getDb("groupay_db"); 
  const paymentsCollection = db.collection("payment");

  const existingPending = await paymentsCollection.findOne({
    groupId: groupId,
    payee: new ObjectId(payeeId),
    payer: new ObjectId(payerId),
    status: "pending",
  });

  if (existingPending) {
    return { success: false, payment: existingPending };
  }

  const newPayment = {
    payee: new ObjectId(payeeId),
    payer: new ObjectId(payerId),
    amount,
    groupId,
    status: "pending",
    date: new Date(),
  };

  const result1 = await paymentsCollection.insertOne(newPayment);

  const groupCollection = db.collection("group");
  await groupCollection.updateOne(
    { _id: new ObjectId(groupId) },
    { $push: { payments: result1.insertedId } }
  );

  return {
    success: true,
    payment: {
      id: result1.insertedId.toString(),
      ...newPayment,
    },
  };
}
