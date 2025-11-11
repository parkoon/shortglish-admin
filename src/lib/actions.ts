"use client";

import { logout as supabaseLogout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();

  const logout = async () => {
    try {
      await supabaseLogout();
      router.push("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      // 에러가 발생해도 로그인 페이지로 이동
      router.push("/login");
    }
  };

  return { logout };
}
