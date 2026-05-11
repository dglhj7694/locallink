import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "LocalLink - 우리 동네 커뮤니티",
  description: "관심사 기반 동네 모임과 커뮤니티 플랫폼. 맛집 탐방, 러닝, 보드게임 등 다양한 모임에 참여하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
