"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { useAuth } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
          <Button onClick={handleLogout} variant="outline">
            로그아웃
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            환영합니다!
          </h2>
          <p className="mt-2 text-gray-600">
            관리자 대시보드에 오신 것을 환영합니다.
          </p>
        </div>
      </main>
    </div>
  );
}
