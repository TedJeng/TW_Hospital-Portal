"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Hospital } from "@/types";

interface UseHospitalSearchResult {
  hospitals: Hospital[];
  allHospitals: Hospital[];
  isLoading: boolean;
  error: string | null;
  search: (query: string, city?: string) => void;
  total: number;
}

export const useHospitalSearch = (): UseHospitalSearchResult => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [allHospitals, setAllHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const initialLoadDone = useRef(false);

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
      const data = json.data as Hospital[];
      setHospitals(data);
      setTotal(json.total);

      // Capture the full list on the very first (unfiltered) load
      if (!initialLoadDone.current) {
        setAllHospitals(data);
        initialLoadDone.current = true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知錯誤");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    search("");
  }, [search]);

  return { hospitals, allHospitals, isLoading, error, search, total };
};
