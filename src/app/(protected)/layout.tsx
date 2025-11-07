"use client";

import { isAuthenticated } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, Video, LogOut } from "lucide-react";

const menuItems = [
  {
    title: "대시보드",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "비디오",
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
          <div className="border-b p-6">
            <h1 className="text-lg font-semibold text-gray-900">
              Shortglish Admin
            </h1>
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
                    className={`w-full justify-start font-normal ${
                      isActive
                        ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
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
