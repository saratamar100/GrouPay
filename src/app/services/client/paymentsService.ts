import { Payment } from "@/app/types/types";

export const createPayment = (getterId: string, amount: number) => {
  return [];
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
