"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdminEmail, ensureAdminRole } from "@/lib/auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Magic Link 콜백에서 세션 확인
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(`세션 확인 실패: ${sessionError.message}`);
        }

        if (!session) {
          throw new Error("로그인 세션이 없습니다.");
        }

        // 어드민 이메일 체크
        const userEmail = session.user.email;
        if (!isAdminEmail(userEmail)) {
          await supabase.auth.signOut();
          throw new Error(
            "어드민 권한이 없는 이메일입니다. 허용된 어드민 이메일로만 로그인할 수 있습니다."
          );
        }

        // user_metadata에 role 설정
        await ensureAdminRole();

        // 로그인 성공 - 메인 페이지로 리다이렉트
        router.push("/videos");
      } catch (err) {
        setError(err instanceof Error ? err.message : "로그인 처리 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-lg font-semibold text-gray-900">
            로그인 처리 중...
          </div>
          <div className="text-sm text-gray-600">잠시만 기다려주세요.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">로그인 실패</h1>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => router.push("/login")}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

