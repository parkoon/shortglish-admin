"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function SupabaseTestPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");
  const [tableCount, setTableCount] = useState<number>(0);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    async function testConnection() {
      try {
        // 간단한 쿼리로 연결 테스트
        const { data, error } = await supabase
          .from("products")
          .select("id")
          .limit(1);

        if (error) {
          throw error;
        }

        setTableCount(data?.length || 0);
        setStatus("success");
        setMessage("Supabase 연결 성공!");
      } catch (err: any) {
        setStatus("error");
        setMessage(`연결 실패: ${err.message}`);
      }
    }

    testConnection();
  }, [router]);

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-white p-8 shadow">
          <h1 className="mb-6 text-2xl font-bold">Supabase 연결 테스트</h1>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">연결 상태:</p>
              <div className="mt-2 flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    status === "loading"
                      ? "bg-yellow-500 animate-pulse"
                      : status === "success"
                        ? "bg-green-500"
                        : "bg-red-500"
                  }`}
                />
                <span
                  className={`font-medium ${
                    status === "success"
                      ? "text-green-700"
                      : status === "error"
                        ? "text-red-700"
                        : "text-yellow-700"
                  }`}
                >
                  {status === "loading"
                    ? "연결 중..."
                    : status === "success"
                      ? "연결 성공"
                      : "연결 실패"}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">메시지:</p>
              <p className="mt-1 text-sm text-gray-600">{message}</p>
            </div>

            {status === "success" && (
              <div>
                <p className="text-sm font-medium text-gray-700">
                  확인된 테이블:
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  products 테이블에서 데이터 조회 성공
                </p>
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                다시 테스트
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

