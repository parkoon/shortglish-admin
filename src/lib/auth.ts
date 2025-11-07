import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_SECRET = "admin-secret-key-change-in-production";

export async function createSession() {
  const cookieStore = await cookies();
  const sessionId = crypto.randomUUID();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7일
    path: "/",
  });
  return sessionId;
}

export async function getSession() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}

