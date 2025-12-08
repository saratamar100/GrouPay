export async function setGroupActiveStatusApi(
  groupId: string,
  newStatus: boolean
): Promise<void> {
  const res = await fetch(`/api/groups/${groupId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive: newStatus }),
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Failed to update group status." }));
    throw new Error(
      errorData.message || "שגיאה בשרת. לא ניתן לעדכן את הסטטוס."
    );
  }
}
