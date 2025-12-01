export async function updateUserProfile(
  id: string,
  name: string,
  photoURL?: string | null
) {
  try {
    const payload = {
      id,
      name,
      photoURL: photoURL || null,
    };

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data?.error || "עדכון נכשל");

    return {
      success: true,
      user: data?.user ?? null,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "שגיאה בעדכון הפרופיל",
    };
  }
}
