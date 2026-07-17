'use client';

import { useEffect, useState } from 'react';
import type { Artist, Album, Song } from '@/types/database';

interface SearchResults {
  artists: Artist[];
  albums: Album[];
  songs: Song[];
}

const EMPTY: SearchResults = { artists: [], albums: [], songs: [] };

export function useInstantSearch(query: string, debounceMs = 300) {
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(EMPTY);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        setResults(data);
      } catch {
        // requisição cancelada por uma digitação mais nova — ignora
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, debounceMs]);

  return { results, isLoading };
}
