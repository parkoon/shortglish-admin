"use client";

import { createSession, deleteSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

const ADMIN_USERNAME = "freedom";
const ADMIN_PASSWORD = "q1w2e3r4t5^";

export function useAuth() {
  const router = useRouter();

  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      createSession();
      return true;
    }
    return false;
  };

  const logout = () => {
    deleteSession();
    router.push("/login");
  };

  return { login, logout };
}
