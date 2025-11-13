import { addUser } from "@/app/services/server/login";

export async function POST(request: Request) {
  const userData: {
    name: string;
    email: string;
    photoURL: string;
    phone: string;
  } = await request.json();
  const [isAdded, user] = await addUser(userData);
  if (!isAdded) {
    return new Response(JSON.stringify(user), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }
  return new Response(JSON.stringify(user), {
    headers: { "Content-Type": "application/json" },
    status: 201,
  });
}
