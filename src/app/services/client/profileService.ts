export async function updateUserProfile(payload: any) {
  try {
    const res = await fetch("/api/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data?.error || "עדכון נכשל");

    return { success: true, message: data?.message || "הפרופיל עודכן בהצלחה" };
  } catch (err: any) {
    return { success: false, message: err?.message || "שגיאה בעדכון הפרופיל" };
  }
}
