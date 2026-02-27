"use client";

import { useState, useEffect, useCallback } from "react";
import type { Hospital } from "@/types";

interface UseHospitalSearchResult {
  hospitals: Hospital[];
  isLoading: boolean;
  error: string | null;
  search: (query: string, city?: string) => void;
  total: number;
}

export const useHospitalSearch = (): UseHospitalSearchResult => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const search = useCallback(async (query: string, city?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (city) params.set("city", city);

      const res = await fetch(`/api/hospitals?${params.toString()}`);

      if (!res.ok) throw new Error("資料取得失敗");

      const json = await res.json();
      setHospitals(json.data);
      setTotal(json.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知錯誤");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    search("");
  }, [search]);

  return { hospitals, isLoading, error, search, total };
};
