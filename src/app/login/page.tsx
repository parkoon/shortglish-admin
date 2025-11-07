"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { useAuth } from "@/lib/actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  username: z.string().min(1, "아이디를 입력하세요"),
  password: z.string().min(1, "비밀번호를 입력하세요"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const onSubmit = async (data: LoginFormData) => {
    const success = login(data.username, data.password);

    if (success) {
      // 쿠키 설정 후 리다이렉트
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 100);
    } else {
      setError("root", {
        type: "manual",
        message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
    }
  };

  if (isAuthenticated()) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">관리자 로그인</h1>
          <p className="mt-2 text-sm text-gray-600">
            관리자 계정으로 로그인하세요
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">아이디</Label>
              <Input
                id="username"
                type="text"
                placeholder="아이디를 입력하세요"
                disabled={isSubmitting}
                className="w-full"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                disabled={isSubmitting}
                className="w-full"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {errors.root && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {errors.root.message}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </div>
    </div>
  );
}
