export type CurrencyConfig = {
  code: string;
  symbol: string;
  locale: string;
  decimalPlaces: number;
};

export const DEFAULT_STORE_CURRENCY: CurrencyConfig = {
  code: "USD",
  symbol: "$",
  locale: "en-US",
  decimalPlaces: 2,
};

export function formatCurrencyAmount(amount: number, c: CurrencyConfig): string {
  try {
    return new Intl.NumberFormat(c.locale, {
      style: "currency",
      currency: c.code,
      minimumFractionDigits: c.decimalPlaces,
      maximumFractionDigits: c.decimalPlaces,
    }).format(amount);
  } catch {
    return `${c.symbol}${amount.toFixed(c.decimalPlaces)}`;
  }
}
