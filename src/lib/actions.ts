"use server";

import { createSession, deleteSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const ADMIN_USERNAME = "freedom";
const ADMIN_PASSWORD = "q1w2e3r4t5^";

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    await createSession();
    redirect("/dashboard");
  } else {
    throw new Error("Invalid credentials");
  }
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

