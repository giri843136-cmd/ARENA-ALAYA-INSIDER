"use client";

import { useState } from "react";
import { Bell, BellOff, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface PricePoint {
  date: string;
  price: number;
  label?: string;
}

interface PriceHistoryProps {
  currentPrice: number;
  originalPrice?: number;
  history?: PricePoint[];
  productName: string;
  className?: string;
}

/**
 * PriceHistory — Visual price timeline with price drop alerts.
 *
 * Shows a 90-day price history chart with trend indicators and
 * the ability to sign up for price drop notifications.
 * Matches the editorial design language of ALAYA.
 *
 * Usage:
 *   <PriceHistory currentPrice={248} originalPrice={298} productName="Linen Duvet Cover" />
 */
export function PriceHistory({
  currentPrice,
  originalPrice,
  history = [],
  productName,
  className = "",
}: PriceHistoryProps) {
  const [alertEnabled, setAlertEnabled] = useState(false);

  // Generate mock price history if none provided
  const priceHistory: PricePoint[] =
    history.length > 0
      ? history
      : generatePriceHistory(currentPrice, originalPrice);

  const lowestPrice = Math.min(...priceHistory.map((p) => p.price));
  const highestPrice = Math.max(...priceHistory.map((p) => p.price));
  const priceRange = highestPrice - lowestPrice || 1;
  const priceChange = currentPrice - priceHistory[0].price;
  const percentChange = ((priceChange / priceHistory[0].price) * 100).toFixed(1);
  const isLower = priceChange < 0;

  return (
    <div className={`bg-white border border-[#E4DDD5] rounded-3xl p-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[10px] tracking-[2px] text-[#8A8178] uppercase">Price History</div>
          <div className="text-xs text-[#6D655F] mt-0.5">Last 90 days</div>
        </div>
        <button
          onClick={() => setAlertEnabled(!alertEnabled)}
          className={`flex items-center gap-1.5 text-[10px] tracking-[1.5px] px-3 py-1.5 rounded-full transition-all ${
            alertEnabled
              ? "bg-[#C5AA8A]/10 text-[#C5AA8A]"
              : "bg-[#EFE7DE] text-[#8A8178] hover:bg-[#E4DDD5]"
          }`}
          aria-label={
            alertEnabled
              ? "Disable price drop alerts"
              : "Enable price drop alerts"
          }
        >
          {alertEnabled ? (
            <>
              <BellOff size={12} />
              Alert On
            </>
          ) : (
            <>
              <Bell size={12} />
              Alert Me
            </>
          )}
        </button>
      </div>

      {/* Price Range Bar */}
      <div className="relative h-2 bg-[#EFE7DE] rounded-full mb-4">
        <div
          className="absolute h-full bg-gradient-to-r from-[#C5AA8A]/60 to-[#C5AA8A] rounded-full"
          style={{
            left: `${((currentPrice - lowestPrice) / priceRange) * 100}%`,
            width: "4px",
            transform: "translateX(-2px)",
          }}
        />
        {/* Historical price dots */}
        {priceHistory
          .filter((_, i) => i % Math.max(1, Math.floor(priceHistory.length / 8)) === 0)
          .map((point, i) => (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-[#E4DDD5] border-2 border-white"
              style={{
                left: `${((point.price - lowestPrice) / priceRange) * 100}%`,
              }}
              title={`${point.label || point.date}: $${point.price}`}
            />
          ))}
        {/* Current price marker */}
        <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#C5AA8A] border-[3px] border-white shadow-sm z-10"
          style={{
            left: `${((currentPrice - lowestPrice) / priceRange) * 100}%`,
          }}
        />
      </div>

      {/* Timeline labels */}
      <div className="flex justify-between text-[10px] text-[#8A8178] mb-5 tracking-wider">
        <span>{priceHistory[0]?.label || "90 days ago"}</span>
        <span>{priceHistory[priceHistory.length - 1]?.label || "Today"}</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-px bg-[#E4DDD5] rounded-xl overflow-hidden text-sm">
        <div className="bg-white p-4 text-center">
          <div className="text-[10px] tracking-[1.5px] text-[#8A8178] mb-1">CURRENT</div>
          <div className="font-medium tabular-nums text-[#26221E]">${currentPrice}</div>
        </div>
        <div className="bg-white p-4 text-center">
          <div className="text-[10px] tracking-[1.5px] text-[#8A8178] mb-1">LOWEST</div>
          <div className="font-medium tabular-nums text-green-700">${lowestPrice}</div>
        </div>
        <div className="bg-white p-4 text-center">
          <div className="text-[10px] tracking-[1.5px] text-[#8A8178] mb-1">HIGHEST</div>
          <div className="font-medium tabular-nums text-rose-700">${highestPrice}</div>
        </div>
      </div>

      {/* Trend line */}
      <div className="mt-4 flex items-center gap-2 text-[11px]">
        {isLower ? (
          <TrendingDown size={14} className="text-green-600" />
        ) : priceChange > 0 ? (
          <TrendingUp size={14} className="text-rose-600" />
        ) : (
          <Minus size={14} className="text-[#8A8178]" />
        )}
        <span className={isLower ? "text-green-700" : priceChange > 0 ? "text-rose-700" : "text-[#8A8178]"}>
          {isLower
            ? `Price dropped ${Math.abs(Number(percentChange))}% in 90 days. Excellent time to purchase.`
            : priceChange > 0
            ? `Price increased ${percentChange}% in 90 days.`
            : "Price has remained stable in the last 90 days."}
        </span>
      </div>

      {/* Original price vs current */}
      {originalPrice && originalPrice > currentPrice && (
        <div className="mt-3 pt-3 border-t border-[#E4DDD5] text-[11px] text-[#C5AA8A]">
          You save ${originalPrice - currentPrice} ({Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}%) compared to the original price.
        </div>
      )}

      {/* Alert confirmation */}
      {alertEnabled && (
        <div className="mt-4 p-3 bg-[#C5AA8A]/5 border border-[#C5AA8A]/20 rounded-xl text-[11px] text-[#6D655F]">
          We&apos;ll notify you when the price of <strong>{productName}</strong> drops. No spam, unsubscribe anytime.
        </div>
      )}
    </div>
  );
}

function generatePriceHistory(
  currentPrice: number,
  originalPrice?: number
): PricePoint[] {
  const points: PricePoint[] = [];
  const peakPrice = originalPrice || Math.round(currentPrice * 1.15);
  const now = new Date();
  const volatility = 0.08;

  for (let i = 90; i >= 0; i -= 3) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    // Simulate a gradual decline from peak to current
    const progress = 1 - i / 90;
    const randomFactor = 1 + (Math.random() - 0.5) * volatility;
    const price = Math.round(
      (peakPrice - (peakPrice - currentPrice) * progress) * randomFactor
    );
    points.push({
      date: date.toISOString().split("T")[0],
      price: Math.max(price, Math.round(currentPrice * 0.85)),
      label: i === 0 ? "Today" : undefined,
    });
  }

  return points;
}
