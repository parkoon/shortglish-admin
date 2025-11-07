import Cookies from "js-cookie";

const SESSION_COOKIE_NAME = "admin_session";

// 클라이언트 사이드 쿠키 관리
export function createSession(): string {
  const sessionId = crypto.randomUUID();
  Cookies.set(SESSION_COOKIE_NAME, sessionId, {
    expires: 7, // 7일
    path: "/",
    sameSite: "lax",
  });
  return sessionId;
}

export function getSession(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return Cookies.get(SESSION_COOKIE_NAME);
}

export function deleteSession(): void {
  Cookies.remove(SESSION_COOKIE_NAME, { path: "/" });
}

export function isAuthenticated(): boolean {
  return !!getSession();
}
