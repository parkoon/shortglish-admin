import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  // Cloudflare Pages를 위한 설정
  // 소스맵 비활성화로 빌드 크기 감소
  // productionBrowserSourceMaps: false,
  // Cloudflare Pages는 Next.js 런타임을 지원하므로 standalone 제거
  // standalone은 모든 의존성을 포함해 파일 크기가 너무 커질 수 있음
  // output: "standalone", // 제거 - Cloudflare Pages가 자동으로 처리
};

export default nextConfig;
