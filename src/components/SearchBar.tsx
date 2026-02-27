"use client";

import { useState, useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string, city?: string) => void;
}

const CITIES = [
  "全部縣市",
  "台北市",
  "新北市",
  "桃園市",
  "台中市",
  "台南市",
  "高雄市",
  "基隆市",
  "新竹市",
  "嘉義市",
  "宜蘭縣",
  "花蓮縣",
  "台東縣",
  "澎湖縣",
];

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("全部縣市");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (q: string, city: string) => {
    const cityParam = city === "全部縣市" ? undefined : city;
    onSearch(q, cityParam);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    handleSearch(val, selectedCity);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setSelectedCity(city);
    handleSearch(query, city);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedCity("全部縣市");
    onSearch("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      {/* Text search */}
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="搜尋醫院名稱、地址…"
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
        />
        {query && (
          <button
            onClick={handleClear}
            aria-label="清空搜尋"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* City filter */}
      <select
        value={selectedCity}
        onChange={handleCityChange}
        className="rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition md:w-40"
      >
        {CITIES.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SearchBar;
