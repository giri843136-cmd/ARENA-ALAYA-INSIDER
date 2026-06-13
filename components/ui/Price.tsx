interface PriceProps {
  price: number;
  salePrice?: number | null;
  currency?: string;
  showDiscount?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Displays price with optional sale price and discount badge.
 * Supports multiple sizes and currency formatting.
 */
export function Price({
  price,
  salePrice,
  currency = "USD",
  showDiscount = true,
  size = "md",
  className = "",
}: PriceProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;
  const hasSale = salePrice !== null && salePrice !== undefined && salePrice < price;

  const sizeClasses: Record<string, string> = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl font-semibold",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {hasSale && salePrice ? (
        <>
          <span className={`${sizeClasses[size]} text-[#26221E] dark:text-[#EDE6DC] font-medium`}>
            {formatPrice(salePrice)}
          </span>
          <span className={`text-[#5C5249] line-through ${size === "sm" ? "text-xs" : "text-sm"}`}>
            {formatPrice(price)}
          </span>
          {showDiscount && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#FEE2E2] text-[#DC2626] rounded-full">
              -{discount}%
            </span>
          )}
        </>
      ) : (
        <span className={`${sizeClasses[size]} text-[#26221E] dark:text-[#EDE6DC] font-medium`}>
          {formatPrice(price)}
        </span>
      )}
    </div>
  );
}
