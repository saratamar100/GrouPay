export async function sendContactMessage(data: {
  email: string;
  name: string,
  subject:string
  message: string;
}) {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to send contact message");
  }

  return await res.json();
}
