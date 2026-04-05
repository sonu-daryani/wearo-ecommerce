"use client";

import { useCompanyCurrency } from "@/context/CompanyCurrencyContext";
import { cn } from "@/lib/utils";

export type ProductPriceSource = {
  price: number;
  discount: { amount: number; percentage: number };
};

type Size = "card" | "hero";

const sizeClasses: Record<
  Size,
  { main: string; strike: string; badge: string }
> = {
  card: {
    main: "text-xl xl:text-2xl",
    strike: "text-xl xl:text-2xl",
    badge: "text-[10px] xl:text-xs py-1.5 px-3.5",
  },
  hero: {
    main: "text-2xl sm:text-[32px]",
    strike: "text-2xl sm:text-[32px]",
    badge: "text-[10px] sm:text-xs py-1.5 px-3.5",
  },
};

export function ProductPriceDisplay({
  data,
  size = "card",
  className,
}: {
  data: ProductPriceSource;
  size?: Size;
  className?: string;
}) {
  const { formatPrice } = useCompanyCurrency();
  const sc = sizeClasses[size];

  const final =
    data.discount.percentage > 0
      ? Math.round(data.price - (data.price * data.discount.percentage) / 100)
      : data.discount.amount > 0
        ? Math.round(data.price - data.discount.amount)
        : data.price;

  const discountAmountLabel =
    data.discount.amount > 0 ? `-${formatPrice(data.discount.amount)}` : null;

  return (
    <div className={cn("flex items-center flex-wrap gap-x-[5px] xl:gap-x-2.5", className)}>
      <span className={cn("font-bold text-foreground", sc.main)}>{formatPrice(final)}</span>
      {data.discount.percentage > 0 && (
        <span className={cn("font-bold text-muted-foreground line-through", sc.strike)}>
          {formatPrice(data.price)}
        </span>
      )}
      {data.discount.amount > 0 && (
        <span className={cn("font-bold text-muted-foreground line-through", sc.strike)}>
          {formatPrice(data.price)}
        </span>
      )}
      {data.discount.percentage > 0 ? (
        <span
          className={cn(
            "font-medium rounded-full bg-[#FF3333]/10 text-[#FF3333]",
            sc.badge
          )}
        >
          -{data.discount.percentage}%
        </span>
      ) : (
        data.discount.amount > 0 && (
          <span
            className={cn(
              "font-medium rounded-full bg-[#FF3333]/10 text-[#FF3333]",
              sc.badge
            )}
          >
            {discountAmountLabel}
          </span>
        )
      )}
    </div>
  );
}
