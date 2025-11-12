import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Supabase 클라이언트를 lazy하게 초기화하여 빌드 타임 에러 방지
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  // 이미 생성된 인스턴스가 있으면 재사용
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // 환경 변수 체크 (런타임에만 실행됨)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env.local file or Cloudflare Pages environment variables."
    );
  }

  // 클라이언트 생성 및 캐싱
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseInstance;
}

// 클라이언트 컴포넌트용 Supabase 클라이언트
// getter를 사용하여 lazy initialization 보장
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];

    // 함수인 경우 this 바인딩 유지
    if (typeof value === "function") {
      return value.bind(client);
    }

    return value;
  },
});
