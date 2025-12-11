import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "인사이트빌드 | 비즈니스 모델 외주·컨설팅 전문 기업",
  description:
    "인사이트빌드는 비즈니스 모델 설계, 시장 분석, 실행 전략 컨설팅을 제공하는 전문 기업입니다.",
  icons: "/favicon.ico",
  openGraph: {
    title: "인사이트빌드 | 비즈니스 모델 외주·컨설팅 전문 기업",
    description:
      "비즈니스 모델 설계, 시장 조사, 실행 전략 컨설팅 전문 기업.",
    url: "https://insightbuild.kr",
    siteName: "인사이트빌드 Insightbuild",
    type: "website",
    images: [
      {
        url: "https://insightbuild.kr/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "인사이트빌드",
    url: "https://insightbuild.kr",
    description:
      "비즈니스 모델 설계, 사업계획서 외주, 시장 분석, 실행 전략 컨설팅을 제공하는 전문 기업입니다.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "KR",
    },
  };

  return (
    <html lang="ko">
      <head>
        <meta
          name="naver-site-verification"
          content="네이버값"
        />
        <meta
          name="google-site-verification"
          content="구글값"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
