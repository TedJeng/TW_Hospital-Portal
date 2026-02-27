"use client";

import { useCallback } from "react";
import { Hospital as HospitalIcon, Loader2, AlertCircle } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import HospitalCard from "@/components/HospitalCard";
import { useHospitalSearch } from "@/hooks/useHospitalSearch";

const HomePage = () => {
  const { hospitals, isLoading, error, search, total } = useHospitalSearch();

  const handleSearch = useCallback(
    (query: string, city?: string) => {
      search(query, city);
    },
    [search]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600">
            <HospitalIcon size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800 leading-none">
              台灣市立醫院入口網
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Taiwan Municipal Hospital Portal
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 md:text-3xl">
            快速查詢全台市立醫院
          </h2>
          <p className="mt-2 text-gray-500 text-sm md:text-base">
            搜尋台灣各縣市公立醫院，取得地址、電話及官網資訊
          </p>
        </section>

        {/* Search */}
        <section className="mb-8 max-w-2xl mx-auto">
          <SearchBar onSearch={handleSearch} />
        </section>

        {/* Results Count */}
        {!isLoading && !error && (
          <p className="text-sm text-gray-500 mb-5 text-center">
            共找到 <span className="font-semibold text-blue-600">{total}</span>{" "}
            間醫院
          </p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <p className="text-sm text-gray-400">載入中…</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
            <AlertCircle size={32} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Hospital Grid */}
        {!isLoading && !error && (
          <>
            {hospitals.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {hospitals.map((hospital) => (
                  <HospitalCard key={hospital.id} hospital={hospital} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                <HospitalIcon size={40} className="opacity-30" />
                <p className="text-sm">找不到符合條件的醫院</p>
                <p className="text-xs">請嘗試其他關鍵字或縣市</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-100 bg-white py-6">
        <div className="container mx-auto px-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} 台灣市立醫院入口網・資料僅供參考，請以各醫院官網為準
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
