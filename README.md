# 台灣醫院入口網 · Taiwan Hospital Portal

快速查詢台灣各縣市醫院資訊，包含地址、電話、科別、官方網站與網路掛號連結。

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
| 📅 網路掛號 | 點擊綠色按鈕直接前往醫院網路掛號頁面 |
| 🌐 官方網站 | 點擊藍色按鈕前往醫院官方網站 |
| 📱 RWD 響應式 | 支援手機、平板、桌機 |

## 資料來源

- **醫院清單**：衛生福利部「醫療機構與人員基本資料」開放資料（2024-12-31 版），共收錄 **481 間醫院**
- **官方網站 / 掛號連結**：透過爬蟲從 [hospitals.tw](https://hospitals.tw) 自動彙整，涵蓋 **268 間官網**、**232 間掛號連結**
- 資料更新腳本：[`convert_hospitals.py`](convert_hospitals.py)（衛福部 ODS 轉換）、[`find_hospital_urls.py`](find_hospital_urls.py)（爬蟲）

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
│   ├── layout.tsx               # 全域 metadata（SEO）+ Google Analytics
│   ├── page.tsx                 # 首頁（搜尋 + 頁籤）
│   ├── sitemap.ts               # /sitemap.xml
│   └── robots.ts                # /robots.txt
├── components/
│   ├── GoogleAnalytics.tsx      # GA4 追蹤元件（NEXT_PUBLIC_GA_ID）
│   ├── HospitalCard.tsx         # 醫院卡片（掛號/官網/地圖/常用）
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
NEXT_PUBLIC_GA_ID    = G-XXXXXXXXXX
```

| 變數 | 說明 |
|------|------|
| `NEXT_PUBLIC_SITE_URL` | 用於生成正確的 `sitemap.xml` canonical URL 與 OpenGraph 資訊 |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 Measurement ID（選填，未設定時不載入 GA） |

## 更新醫院資料

### 一、從衛福部 ODS 重新產生醫院清單

```bash
# 安裝 Python 相依套件
pip install pandas odfpy

# 執行轉換（ODS 檔放置於專案根目錄）
python convert_hospitals.py
```

> ODS 資料檔可從[衛生福利部開放資料平台](https://data.gov.tw/)下載。

### 二、更新官網與網路掛號連結（爬蟲）

```bash
# 安裝 Python 相依套件
pip install requests beautifulsoup4

# 爬取所有醫院的官網與掛號連結（約 30～40 分鐘）
python find_hospital_urls.py

# 合併結果到 hospitals.json
python find_hospital_urls.py --merge

# 其他選項
python find_hospital_urls.py --stats          # 顯示統計
python find_hospital_urls.py --start 100      # 從第 100 筆開始（斷點續行）
python find_hospital_urls.py --count 20       # 只處理 20 筆（測試用）
python find_hospital_urls.py --force          # 忽略快取，強制重新爬取
```

> 爬蟲資料來源：[hospitals.tw](https://hospitals.tw)，進度自動儲存於 `hospital_urls_cache.json`。

## License

MIT
