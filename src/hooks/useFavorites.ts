"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "tw-hospital-favorites";

export const useFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavoriteIds(new Set(JSON.parse(stored) as string[]));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favoriteIds.has(id),
    [favoriteIds]
  );

  return { favoriteIds, toggleFavorite, isFavorite, count: favoriteIds.size };
};
