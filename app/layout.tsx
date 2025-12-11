import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Insightbuild | 인사이트빌드",
  description: "깊이 있는 인사이트로, 당신의 사업을 빌드업합니다.",
  // 여기에는 더 이상 verification 안 넣어도 됨
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta
          name="naver-site-verification"
          content="a0dc99f11a7b3b00e5344c4e36f7e33d3c126a47"
        />
      </head>
      <body className={`${outfit.variable} antialiased`}>{children}</body>
    </html>
  );
}
