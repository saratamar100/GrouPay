import { addUser } from "@/app/services/server/users";

export async function POST(request: Request) {
  const userData = await request.json();
  const isAdded = addUser(userData);
  if (!isAdded) {
    return new Response(JSON.stringify({ message: "Failed to create user" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
  return new Response(
    JSON.stringify({ message: "User created", user: userData }),
    {
      headers: { "Content-Type": "application/json" },
      status: 201,
    }
  );
}
