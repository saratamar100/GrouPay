import { NextResponse } from "next/server";
import { addUser } from "@/app/services/server/login";
import { signAuthToken } from "@/app/services/server/auth";

export async function POST(request: Request) {
  const userData = await request.json();

  const [isAdded, user] = await addUser(userData);

  const token = await signAuthToken(user.id);

  const response = NextResponse.json(user, {
    status: isAdded ? 201 : 200,
  });

  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2, 
  });

  return response;
}
