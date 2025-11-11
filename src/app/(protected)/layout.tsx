/* eslint-disable @next/next/no-img-element */
"use client";

import { isAuthenticated, isAdmin } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Video,
  FolderTree,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

type MenuItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type MenuGroup = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
};

const menuGroups: MenuGroup[] = [
  {
    title: "영상",
    icon: Video,
    items: [
      {
        title: "영상 관리",
        href: "/videos",
        icon: Video,
      },
      {
        title: "카테고리 관리",
        href: "/categories",
        icon: FolderTree,
      },
    ],
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

  // 현재 경로가 영상 관련 경로인지 확인
  const isVideoPath =
    pathname.startsWith("/videos") || pathname.startsWith("/categories");

  // 사용자가 수동으로 닫은 그룹 추적
  const [closedGroups, setClosedGroups] = useState<Set<string>>(new Set());

  // pathname에 따라 자동으로 열려야 하는 그룹 계산
  const autoOpenGroups = useMemo(() => {
    const groups = new Set<string>();
    if (isVideoPath) {
      groups.add("영상");
    }
    return groups;
  }, [isVideoPath]);

  // 실제로 열려있는 그룹 계산 (자동 열림 - 수동 닫힘)
  const effectiveOpenGroups = useMemo(() => {
    const merged = new Set<string>();
    autoOpenGroups.forEach((group) => {
      // 사용자가 수동으로 닫지 않은 그룹만 추가
      if (!closedGroups.has(group)) {
        merged.add(group);
      }
    });
    return merged;
  }, [autoOpenGroups, closedGroups]);

  const toggleGroup = (groupTitle: string) => {
    setClosedGroups((prev) => {
      const next = new Set(prev);
      // 현재 열려있으면 닫기, 닫혀있으면 열기
      if (effectiveOpenGroups.has(groupTitle)) {
        next.add(groupTitle); // 닫기
      } else {
        next.delete(groupTitle); // 열기
      }
      return next;
    });
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
          router.push("/login");
          return;
        }

        // 어드민 권한 체크
        const admin = await isAdmin();
        if (!admin) {
          // 어드민이 아니면 로그아웃하고 로그인 페이지로
          await logout();
          return;
        }

        setIsChecking(false);
      } catch (error) {
        console.error("인증 체크 실패:", error);
        router.push("/login");
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-lg font-semibold text-gray-900">
            로딩 중...
          </div>
        </div>
      </div>
    );
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
          <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
            {menuGroups.map((group) => {
              const GroupIcon = group.icon;
              const isOpen = effectiveOpenGroups.has(group.title);
              const hasActiveItem = group.items.some(
                (item) => pathname === item.href
              );

              return (
                <div key={group.title} className="space-y-0.5">
                  {/* 그룹 헤더 */}
                  <Button
                    variant={hasActiveItem ? "secondary" : "ghost"}
                    className={`w-full justify-between font-semibold ${
                      hasActiveItem
                        ? "bg-slate-100 text-slate-900 hover:bg-slate-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => toggleGroup(group.title)}
                  >
                    <div className="flex items-center gap-2">
                      <GroupIcon className="h-4 w-4" />
                      {group.title}
                    </div>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>

                  {/* 하위 메뉴 아이템 */}
                  {isOpen && (
                    <div className="ml-4 space-y-0.5 mt-0.5">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                          <Link key={item.href} href={item.href}>
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              className={`w-full justify-start font-normal ${
                                isActive
                                  ? "bg-slate-100 text-slate-900 hover:bg-slate-200"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <ItemIcon className="h-4 w-4 mr-2" />
                              {item.title}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
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
