import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";

export const metadata: Metadata = {
  title: "숏글리시 - 어드민",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="antialiased font-sans">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
