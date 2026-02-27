# 台灣醫院入口網 · Taiwan Hospital Portal

快速查詢台灣各縣市醫院資訊，包含地址、電話、科別與官方網站連結。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TedJeng/TW_Hospital-Portal)

---

## 功能特色

| 功能 | 說明 |
|------|------|
| 🔍 即時搜尋 | 輸入醫院名稱或地址，即時篩選結果 |
| 🗺️ 縣市篩選 | 下拉選單快速切換 22 個縣市 |
| ❤️ 常用醫院 | 收藏常用醫院，資料存於 localStorage 不會遺失 |
| 📍 地圖導航 | 點擊地址直接開啟 Google Maps |
| 📞 一鍵撥號 | 點擊電話號碼直接撥打（行動裝置） |
| 📱 RWD 響應式 | 支援手機、平板、桌機 |

## 資料來源

- **醫院清單**：衛生福利部「醫療機構與人員基本資料」開放資料（2024-12-31 版），共收錄 **481 間醫院**
- 資料更新腳本：[`convert_hospitals.py`](convert_hospitals.py)

## 技術棧

| 技術 | 版本 | 用途 |
|------|------|------|
| [Next.js](https://nextjs.org/) | 14.2 | App Router、API Route、SSR |
| [React](https://react.dev/) | 18 | UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 5 | 型別安全 |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4 | 樣式 |
| [Lucide React](https://lucide.dev/) | 0.462 | 圖示 |

## 專案結構

```
src/
├── app/
│   ├── api/hospitals/route.ts   # GET /api/hospitals?q=&city=
│   ├── layout.tsx               # 全域 metadata（SEO）
│   ├── page.tsx                 # 首頁（搜尋 + 頁籤）
│   ├── sitemap.ts               # /sitemap.xml
│   └── robots.ts                # /robots.txt
├── components/
│   ├── HospitalCard.tsx         # 醫院卡片（含常用按鈕、地圖連結）
│   └── SearchBar.tsx            # 搜尋欄 + 縣市下拉
├── hooks/
│   ├── useHospitalSearch.ts     # API 搜尋邏輯
│   └── useFavorites.ts          # 常用醫院（localStorage）
├── data/
│   └── hospitals.json           # 481 間醫院靜態資料
└── types/
    └── index.ts                 # TypeScript 型別定義
```

## 本地開發

**環境需求：** Node.js 18+

```bash
# 安裝相依套件
npm install

# 啟動開發伺服器（http://localhost:3000）
npm run dev

# 建置正式版
npm run build

# 啟動正式版伺服器
npm start
```

## 部署到 Vercel

1. Fork 此專案或直接點擊上方 **Deploy with Vercel** 按鈕
2. 在 Vercel 專案設定中加入環境變數：

```
NEXT_PUBLIC_SITE_URL = https://your-domain.vercel.app
```

> 此變數用於生成正確的 `sitemap.xml` canonical URL 與 OpenGraph 資訊。

## 更新醫院資料

使用 `convert_hospitals.py` 從衛福部 ODS 檔案重新產生 `hospitals.json`：

```bash
# 安裝 Python 相依套件
pip install pandas odfpy

# 執行轉換（ODS 檔放置於專案根目錄）
python convert_hospitals.py
```

> ODS 資料檔可從[衛生福利部開放資料平台](https://data.gov.tw/)下載。

## License

MIT
