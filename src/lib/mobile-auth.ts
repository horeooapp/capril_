import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL: AUTH_SECRET environment variable is missing in production.");
    }
    console.warn("⚠️ AUTH_SECRET is missing. Using a weak default key for development.");
    return new TextEncoder().encode("qapril-default-secret-key-dev-only");
  }
  return new TextEncoder().encode(secret);
};

const SECRET = getSecret();

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
