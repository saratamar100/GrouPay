import { GroupShort } from "@/app/types/types";

export async function getUserGroups(userId: string): Promise<GroupShort[]> {
  const res = await fetch(`/api/dashboard?userId=${userId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch user groups");
  }

  const data = await res.json();

  const groups: GroupShort[] = data.map((g: any) => ({
    id: g.groupId,
    name: g.groupName,
    balance: g.balance,
    isActive: g.isActive,
  }));

  return groups;
}
