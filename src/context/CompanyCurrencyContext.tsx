"use client";

import type { PublicCompanySettings } from "@/lib/company-settings";
import {
  DEFAULT_STORE_CURRENCY,
  formatCurrencyAmount,
  type CurrencyConfig,
} from "@/lib/currency-format";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Ctx = {
  currency: CurrencyConfig;
  loading: boolean;
  formatPrice: (amount: number) => string;
};

const CompanyCurrencyContext = createContext<Ctx | null>(null);

export function CompanyCurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyConfig>(DEFAULT_STORE_CURRENCY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/company-settings");
        const data = (await res.json()) as PublicCompanySettings;
        if (!cancelled && data?.currency) {
          setCurrency({
            code: data.currency.code,
            symbol: data.currency.symbol,
            locale: data.currency.locale,
            decimalPlaces: data.currency.decimalPlaces,
          });
        }
      } catch {
        /* keep default */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatPrice = useCallback(
    (amount: number) => formatCurrencyAmount(amount, currency),
    [currency]
  );

  const value = useMemo(
    () => ({ currency, loading, formatPrice }),
    [currency, loading, formatPrice]
  );

  return (
    <CompanyCurrencyContext.Provider value={value}>{children}</CompanyCurrencyContext.Provider>
  );
}

export function useCompanyCurrency(): Ctx {
  const ctx = useContext(CompanyCurrencyContext);
  if (!ctx) {
    throw new Error("useCompanyCurrency must be used within CompanyCurrencyProvider");
  }
  return ctx;
}
