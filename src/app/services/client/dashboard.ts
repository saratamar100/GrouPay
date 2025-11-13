// services/dashboardService.ts
export interface GroupBalance {
  groupId: string;
  groupName: string;
  balance: number;
}

export async function getUserGroups(userId: string): Promise<GroupBalance[]> {
  const res = await fetch(`/api/dashboard?userId=${userId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch user groups");
  }
  const data: GroupBalance[] = await res.json();
  return data;
}
