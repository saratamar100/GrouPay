import { ObjectId } from "mongodb";
import { getDb } from "./mongo";

export async function fetchPPendingPaymentsForGroup(
  groupId: string,
  userId: string
) {
  const db = await getDb("groupay_db");
  const groupsCollection = db.collection("group");
  const group = await groupsCollection.findOne({ _id: new ObjectId(groupId) });
  console.log({ group });
  const paymentsIds = group.payments;
  const paymetsCollection = db.collection("payment");
  const payments = await paymetsCollection
    .find({
      _id: { $in: paymentsIds },
      status: "pending",
      $or: [{ payer: new ObjectId(userId) }, { payee: new ObjectId(userId) }],
    })
    .toArray();
  console.log({ paymentsIds, userId });
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
  //const group = db.collection("group");

//   const existing = await group.findOne({
//     _id: new ObjectId(groupId),
//   });


//   if (existing) {
//     return {
//       success: false,
//       payment: {
//         id: existing._id.toString(),
//         payeeId: existing.payeeId,
//         payerId: existing.payerId,
//         amount: existing.amount,
//         groupId: existing.groupId,
//         status: existing.status,
//         date: existing.date,
//       },
//     };
//   }

  const newPayment = {
    payee: new ObjectId(payeeId),
    payer:new ObjectId(payerId),
    amount,
    //groupId,
    status: "pending",
    date: new Date(),
  };
   
  const payments = db.collection("payment");
  const result1 = await payments.insertOne(newPayment);
  const group = db.collection("group");
   const result = await group.updateOne(
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
