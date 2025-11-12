import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

// 허용된 어드민 이메일 목록 (2개)
const ALLOWED_ADMIN_EMAILS = [
  // TODO: 실제 어드민 이메일로 변경 필요
  "devparkoon@gmail.com",
  "soobinseon95@gmail.com",
];

/**
 * 이메일/패스워드 로그인
 */
export async function loginWithEmailPassword(
  email: string,
  password: string
): Promise<void> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`로그인 실패: ${error.message}`);
  }

  // 어드민 이메일 체크
  if (!isAdminEmail(data.user.email)) {
    await supabase.auth.signOut();
    throw new Error("어드민 권한이 없는 이메일입니다.");
  }

  // user_metadata에 role 설정
  await ensureAdminRole();
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`로그아웃 실패: ${error.message}`);
  }
}

/**
 * 현재 사용자 조회
 */
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * 인증 상태 확인
 */
export async function isAuthenticated(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session;
}

/**
 * 어드민 이메일 체크
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * 현재 사용자가 어드민인지 확인
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user?.email) return false;
  return isAdminEmail(user.email);
}

/**
 * user_metadata에 admin role 설정
 * 로그인 성공 후 자동으로 호출되어야 함
 */
export async function ensureAdminRole(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("사용자가 로그인되어 있지 않습니다.");
  }

  // 이미 role이 설정되어 있으면 스킵
  if (user.user_metadata?.role === "admin") {
    return;
  }

  // 어드민 이메일인 경우에만 role 설정
  if (!isAdminEmail(user.email)) {
    throw new Error("어드민 권한이 없는 이메일입니다.");
  }

  // user_metadata에 role 추가
  const { error } = await supabase.auth.updateUser({
    data: {
      role: "admin",
    },
  });

  if (error) {
    throw new Error(`Role 설정 실패: ${error.message}`);
  }
}
