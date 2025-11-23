import { Payment } from "@/app/types/types";

export const createPayment = async (payeeId: string, amount: number) => {
//   const res = await fetch("/api/payments", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ payerId:"6915ae6686023c759400e6f6", payeeId, amount }),
//   });

//   if (!res.ok) {
//     throw new Error("Failed to create payment");
//   }

//   const data: Payment = await res.json();
//   return data;
};

export async function fetchPendingPayments(
  groupId: string,
  currentUserId: string
): Promise<Payment[]> {
  return [
    {
      id: "1",
      amount: 1,
      payee: { id: "1", name: "sa" },
      payer: { id: "6915ae6686023c759400e6f6", name: "me" },
      date: new Date(),
      status: "pending",
    },
  ];
}
