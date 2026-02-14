import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "./types";

const COOKIE_NAME = "wybmv_session";
const JWT_ALG = "HS256";

type CookieAttributes = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  maxAge?: number;
};

export type CookieStore = {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, attributes: CookieAttributes): void;
  delete(name: string): void;
};

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not configured.");
}

const secretKey = new TextEncoder().encode(secret);

export async function createSession(
  userId: string,
  cookieStore: CookieStore
): Promise<void> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("2d")
    .sign(secretKey);

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 2
  });
}

export async function clearSession(cookieStore: CookieStore): Promise<void> {
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUser(
  cookieStore: CookieStore
): Promise<SessionUser | null> {
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify<{ userId: string }>(token, secretKey, {
      algorithms: [JWT_ALG]
    });
    if (!payload.userId) return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}


