import { ObjectId } from "mongodb";
import { getDb } from "./mongo";
import { Member, Status } from "@/app/types/types";

export async function fetchPaymentsForGroup(
  groupId: string,
  userId: string,
  status: string | null
) {
  const db = await getDb("groupay_db");
  const groupsCollection = db.collection("group");
  const group = await groupsCollection.findOne({ _id: new ObjectId(groupId) });
  if (!group || !group.payments) return [];

  const userObjectId = new ObjectId(userId);

  const paymentsIds = group.payments;
  const paymentsCollection = db.collection("payment");
  const query: any = {
    _id: { $in: paymentsIds }, 
    $or: [{ "payer.id": userObjectId }, { "payee.id": userObjectId }],
  };
  if (status != null) {
    query.status = status;
  }

  const payments = await paymentsCollection.find(query).toArray();

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
    groupId: new ObjectId(groupId),
    "payee.id": new ObjectId(payee.id),
    "payer.id": new ObjectId(payer.id),
    status: "pending",
  });

  if (existingPending) {
    return { success: false, payment: existingPending };
  }

  const newPayment = {
    payee: payee
      ? {
          id: new ObjectId(payee.id),
          name: payee.name,
        }
      : null,
    payer: payer
      ? {
          id: new ObjectId(payer.id),
          name: payer.name,
        }
      : null,

    amount,
    groupId: new ObjectId(groupId),
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
