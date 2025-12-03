import { Member, Payment } from "@/app/types/types";
import { Status } from "@/app/types/types";

export const createPayment = async (
  payee: Member,
  amount: number,
  groupId: string,
  payer: Member
): Promise<Payment> => {
  try {
    const res = await fetch(`/api/groups/${groupId}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payee,
        amount,
        payer,
        groupId
      }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Failed to create payment");
    }

    return await res.json();
  } catch (err: any) {
    console.error("createPayment error:", err);
    throw err;
  }
};

export async function fetchPendingPayments(
  groupId: string,
  currentUserId: string
): Promise<Payment[]> {
  try {
    const url = `/api/groups/${groupId}/payment?status=pending&userId=${currentUserId}`;
    const res = await fetch(url, { method: "GET" });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Failed to fetch pending payments");
    }

    return await res.json();
  } catch (err: any) {
    console.error("fetchPendingPayments error:", err);
    return [];
  }
}
export const updatePaymentStatus = async (
  payment: Payment,
  groupId: string,
  status: Status
): Promise<boolean> => {
  console.log("Updating payment status:", { payment, status });
  try {
    const res = await fetch(`/api/groups/${groupId}/payment`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentId:payment.id,
        //payer:payment.payer,
        //payee:payment.payee,
        //amount:payment.amount,
        status,
        groupId,
      }),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Failed to update payment status");
    }
    const data = await res.json();
    return data.success;
  } catch (err: any) {
    console.error("updatePaymentStatus error:", err);
    return false;
  }
};
export async function fetchCompletedPayments(
  groupId: string,
  currentUserId: string
): Promise<Payment[]> {
  try {
    const url = `/api/groups/${groupId}/payment?status=completed&userId=${currentUserId}`;
    const res = await fetch(url, { method: "GET" });  
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Failed to fetch completed payments");
    }
    return await res.json();
  } catch (err: any) {
    console.error("fetchCompletedPayments error:", err);
    return [];
  }
}