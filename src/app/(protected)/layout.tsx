/* eslint-disable @next/next/no-img-element */
"use client";

import { isAuthenticated } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Video, LogOut } from "lucide-react";

const menuItems = [
  {
    title: "영상 관리",
    href: "/videos",
    icon: Video,
  },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push("/login");
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking || !isAuthenticated()) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <aside className="w-64 border-r bg-white">
        <div className="flex h-full flex-col">
          {/* 로고/헤더 */}
          <div className="border-b p-4">
            <div className="flex items-center gap-1">
              <img
                className="rounded"
                src="https://atkufyuiprxolawrbwta.supabase.co/storage/v1/object/sign/product-images/logoshort.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYWUwMDA0MS1hZDFmLTQ4YWItOWNjOC0wYzY3ZjQ0MTRkZDQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0LWltYWdlcy9sb2dvc2hvcnQucG5nIiwiaWF0IjoxNzYxODc3NjUyLCJleHAiOjE4NTY0ODU2NTJ9.IqhqErMBP-ay17cvDEJXPCGNv6tVyMKoFI3ftRSI0XM"
                alt="숏글리시 로고"
                width={24}
                height={24}
              />
              <h1 className="font-semibold text-gray-900">글리시 어드민</h1>
            </div>
          </div>

          {/* 메뉴 */}
          <nav className="flex-1 space-y-0.5 p-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start font-semibold ${
                      isActive
                        ? "bg-slate-100 text-slate-900 hover:bg-slate-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* 로그아웃 */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
