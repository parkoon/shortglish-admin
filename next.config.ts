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
  // Next.js 16은 Cloudflare Pages의 런타임을 지원합니다
  output: "standalone",
};

export default nextConfig;
