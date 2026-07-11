import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "kemkan_admin_session";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "kemkan-dev-secret-change-me"
);

export async function createSessionToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.role === "admin";
  } catch {
    return false;
  }
}
