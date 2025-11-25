import { Payment } from "@/app/types/types";

export const createPayment = async (
  payeeId: string,
  amount: number,
  groupId: string,
  payerId: string
): Promise<Payment> => {
  try {
    const res = await fetch(`/api/groups/${groupId}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payeeId,
        amount,
        payerId,
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
    const url = `/api/groups/${groupId}/payment/pending?userId=${currentUserId}`;
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
