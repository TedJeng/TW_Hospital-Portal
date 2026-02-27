import type { Metadata } from "next";
import "./globals.css";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "台灣醫院入口網 | 搜尋全台縣市醫院",
  description:
    "快速查詢台灣各縣市醫院資訊，包含地址、電話與官方網站連結。涵蓋台北市、新北市、桃園市、台中市、台南市、高雄市、基隆市等全台 481 間醫院。",
  keywords: [
    "台灣醫院",
    "醫院查詢",
    "縣市醫院",
    "市立醫院",
    "衛生福利部醫院",
    "台北市立醫院",
    "高雄市立醫院",
    "醫院電話",
    "醫院地址",
    "Taiwan hospital",
  ],
  openGraph: {
    title: "台灣醫院入口網 | 搜尋全台縣市醫院",
    description:
      "快速查詢台灣各縣市醫院資訊，包含地址、電話與官方網站連結",
    locale: "zh_TW",
    type: "website",
    url: baseUrl,
    siteName: "台灣醫院入口網",
  },
  alternates: {
    canonical: baseUrl,
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
};

export default RootLayout;
