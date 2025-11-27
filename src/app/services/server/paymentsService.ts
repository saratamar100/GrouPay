import { ObjectId } from "mongodb";
import { getDb } from "./mongo";
import { Member, Status } from "@/app/types/types";

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
      _id: { $in: paymentsIds }, //change to groupId?
      status: "pending",
      $or: [
        { "payer.id": userId },
        { "payee.id":userId },
      ],
    })
    .toArray();
  return payments.map((p: any) => {
  const { _id, ...rest } = p;
  return {
    id: _id.toString(),
    ...rest,
  };
});

}

interface PaymentInput {
  payee: Member;
  payer: Member;
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
  const { payee, payer, amount, groupId } = input;

  if (!payee || !payer || !amount || !groupId) {
    return { success: false };
  }

  const db = await getDb("groupay_db");
  const paymentsCollection = db.collection("payment");

  const existingPending = await paymentsCollection.findOne({
    groupId: groupId,
    "payee.id":payee.id,
    "payer.id": payer.id,
    status: "pending",
  });

  if (existingPending) {
    return { success: false, payment: existingPending };
  }

  const newPayment = {
    payee, //: new ObjectId(payeeId),
    payer, //: new ObjectId(payerId),
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

export const updatePaymentStatus = async (
  paymentId: string,
  status: Status
): Promise<boolean> => {
  const db = await getDb("groupay_db");
  const paymentsCollection = db.collection("payment");
  const result = await paymentsCollection.updateOne(
    { _id: new ObjectId(paymentId) },
    { $set: { status } }
  );
  return result.modifiedCount === 1;
};
