"use client";

export async function joinGroup(groupId: string, userId: string, name: string) {
  const res = await fetch(`/api/groups/${groupId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, name }),
  });
  if (!res.ok) {
    throw new Error("Failed to create expense");
  }

  return res.json();
}


