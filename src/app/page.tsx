"use client";

import { useCallback, useState, useMemo } from "react";
import {
  Hospital as HospitalIcon,
  Loader2,
  AlertCircle,
  Heart,
} from "lucide-react";
import SearchBar from "@/components/SearchBar";
import HospitalCard from "@/components/HospitalCard";
import { useHospitalSearch } from "@/hooks/useHospitalSearch";
import { useFavorites } from "@/hooks/useFavorites";

type Tab = "all" | "favorites";

const HomePage = () => {
  const { hospitals, allHospitals, isLoading, error, search, total } =
    useHospitalSearch();
  const { isFavorite, toggleFavorite, count: favCount } = useFavorites();

  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCity, setSearchCity] = useState<string | undefined>();

  const handleSearch = useCallback(
    (query: string, city?: string) => {
      setSearchQuery(query);
      setSearchCity(city);
      search(query, city);
    },
    [search]
  );

  const handleTabChange = useCallback(
    (tab: Tab) => {
      setActiveTab(tab);
      if (tab === "all") {
        search(searchQuery, searchCity);
      }
    },
    [search, searchQuery, searchCity]
  );

  // Client-side filter for favorites tab
  const favoriteHospitals = useMemo(() => {
    return allHospitals.filter((h) => {
      if (!isFavorite(h.id)) return false;
      if (searchCity && h.city !== searchCity) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          h.name.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.district.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allHospitals, isFavorite, searchQuery, searchCity]);

  const displayHospitals = activeTab === "all" ? hospitals : favoriteHospitals;
  const displayTotal = activeTab === "all" ? total : favoriteHospitals.length;
  const showLoading = activeTab === "all" && isLoading;
  const showError = activeTab === "all" && error && !isLoading;

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
        <section className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 md:text-3xl">
            快速查詢全台市立醫院
          </h2>
          <p className="mt-2 text-gray-500 text-sm md:text-base">
            搜尋台灣各縣市公立醫院，取得地址、電話及官網資訊
          </p>
        </section>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 max-w-2xl mx-auto">
          <button
            onClick={() => handleTabChange("all")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            全部醫院
          </button>
          <button
            onClick={() => handleTabChange("favorites")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "favorites"
                ? "bg-red-500 text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-200 hover:border-red-300 hover:text-red-500"
            }`}
          >
            <Heart
              size={15}
              className={activeTab === "favorites" ? "fill-white" : ""}
            />
            常用醫院
            {favCount > 0 && (
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                  activeTab === "favorites"
                    ? "bg-white text-red-500"
                    : "bg-red-500 text-white"
                }`}
              >
                {favCount}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <section className="mb-8 max-w-2xl mx-auto">
          <SearchBar onSearch={handleSearch} />
        </section>

        {/* Results Count */}
        {!showLoading && !showError && (
          <p className="text-sm text-gray-500 mb-5 text-center">
            共找到{" "}
            <span className="font-semibold text-blue-600">{displayTotal}</span>{" "}
            間醫院
          </p>
        )}

        {/* Loading */}
        {showLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <p className="text-sm text-gray-400">載入中…</p>
          </div>
        )}

        {/* Error */}
        {showError && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
            <AlertCircle size={32} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Hospital Grid */}
        {!showLoading && !showError && (
          <>
            {displayHospitals.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {displayHospitals.map((hospital) => (
                  <HospitalCard
                    key={hospital.id}
                    hospital={hospital}
                    isFavorite={isFavorite(hospital.id)}
                    onToggleFavorite={() => toggleFavorite(hospital.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                {activeTab === "favorites" ? (
                  <>
                    <Heart size={40} className="opacity-30" />
                    <p className="text-sm">尚未加入任何常用醫院</p>
                    <p className="text-xs">
                      在「全部醫院」頁籤中點擊 ♥ 加入常用
                    </p>
                  </>
                ) : (
                  <>
                    <HospitalIcon size={40} className="opacity-30" />
                    <p className="text-sm">找不到符合條件的醫院</p>
                    <p className="text-xs">請嘗試其他關鍵字或縣市</p>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-100 bg-white py-6">
        <div className="container mx-auto px-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()}{" "}
          台灣市立醫院入口網・資料僅供參考，請以各醫院官網為準
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
