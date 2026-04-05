"use client";

import { useCallback, useState } from "react";

/** Centralized loading flag for async API flows (axios + envelopes). */
export function useApiLoading(initial = false) {
  const [loading, setLoading] = useState(initial);

  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, setLoading, withLoading };
}
