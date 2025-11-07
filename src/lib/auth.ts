const SESSION_COOKIE_NAME = "admin_session";

// 클라이언트 사이드 쿠키 관리
export function createSession() {
  const sessionId = crypto.randomUUID();
  document.cookie = `${SESSION_COOKIE_NAME}=${sessionId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  return sessionId;
}

export function getSession(): string | null {
  if (typeof document === "undefined") return null;
  
  const cookies = document.cookie.split(";");
  const sessionCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${SESSION_COOKIE_NAME}=`)
  );
  
  if (!sessionCookie) return null;
  
  return sessionCookie.split("=")[1];
}

export function deleteSession() {
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0`;
}

export function isAuthenticated(): boolean {
  return !!getSession();
}
