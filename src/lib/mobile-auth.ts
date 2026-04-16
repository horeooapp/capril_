import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "qapril-default-secret-key-change-it-in-env"
);

export async function signMobileToken(userId: string, email: string, role: string) {
  return await new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d") // Long expiration for mobile UX
    .sign(SECRET);
}

export async function verifyMobileToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { userId: string; email: string; role: string };
  } catch (error) {
    return null;
  }
}
