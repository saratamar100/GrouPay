// app/services/client/groupMemberService.ts
import { User } from "@/app/types/types";

export async function fetchAllUsers(): Promise<User[]> {
  const res = await fetch("/api/users");
  if (!res.ok) {
    throw new Error("שגיאה בטעינת משתמשים");
  }
  return res.json();
}

export async function addMemberToGroup(groupId: string, userId: string) {
  const res = await fetch("/api/groups/groupId/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId, userId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || "שגיאה בשרת");
  }
  return data;
}
