import { Debt } from "@/app/types/types";

export async function fetchGroupBalance(groupId: string, userId: string): Promise<Debt[]> {
  if (!groupId || !userId) return [];

  const res = await fetch(`/api/groups/${groupId}/balance?userId=${userId}`);
  
  if (!res.ok) {
    throw new Error("Failed to fetch group balance");
  }

  const data: Debt[] = await res.json();
  return data;
}
