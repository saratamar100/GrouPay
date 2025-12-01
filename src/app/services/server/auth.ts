import { SignJWT, jwtVerify } from "jose";

const SECRET = process.env.AUTH_SECRET;

if (!SECRET) {
  throw new Error("AUTH_SECRET is not set");
}

const secretKey = new TextEncoder().encode(SECRET);

export async function signAuthToken(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secretKey);

  return token;
}

export async function verifyAuthToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as { userId: string; iat: number; exp: number };
  } catch {
    return null;
  }
}
