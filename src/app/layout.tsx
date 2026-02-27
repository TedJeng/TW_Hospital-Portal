import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "台灣市立醫院入口網 | 搜尋全台縣市醫院",
  description:
    "快速查詢台灣各縣市市立醫院資訊，包含地址、電話與官方網站連結。涵蓋台北市、新北市、台中市、台南市、高雄市等主要縣市醫院。",
  keywords: ["台灣", "市立醫院", "縣市醫院", "醫院搜尋", "台北市立醫院"],
  openGraph: {
    title: "台灣市立醫院入口網",
    description: "快速查詢台灣各縣市市立醫院資訊",
    locale: "zh_TW",
    type: "website",
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
