"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, X } from "lucide-react";

interface PurchaseNotification {
  id: string;
  productName: string;
  productImage?: string;
  minutesAgo: number;
  location?: string;
}

const SAMPLE_PRODUCTS = [
  "Cashmere Throw Blanket", "Artisan Coffee Maker", "Bamboo Cutting Board Set",
  "Handcrafted Ceramic Vase", "Linen Bed Sheet Set", "Wool Knit Beanie",
  "Leather Journal", "Scented Candle Set", "Silk Pillowcase",
];

const SAMPLE_LOCATIONS = ["New York", "London", "Los Angeles", "Toronto", "Sydney", "Berlin", "Paris", "Austin", "Chicago", "San Francisco"];

export function SocialProof() {
  const [notification, setNotification] = useState<PurchaseNotification | null>(null);

  useEffect(() => {
    const showNotification = () => {
      const newNotif: PurchaseNotification = {
        id: Math.random().toString(36).slice(2),
        productName: SAMPLE_PRODUCTS[Math.floor(Math.random() * SAMPLE_PRODUCTS.length)],
        minutesAgo: Math.floor(Math.random() * 15) + 1,
        location: SAMPLE_LOCATIONS[Math.floor(Math.random() * SAMPLE_LOCATIONS.length)],
      };
      setNotification(newNotif);
      setTimeout(() => setNotification(null), 5000);
    };

    // Show first notification after 3 seconds
    const initialTimer = setTimeout(showNotification, 3000);
    // Then show every 15-30 seconds
    const interval = setInterval(showNotification, 15000 + Math.random() * 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  if (!notification) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm animate-in slide-in-from-left-2 fade-in duration-500">
      <div className="bg-white/95 backdrop-blur-lg border border-[#E4DDD5] rounded-xl p-3 shadow-lg flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#C5A26F]/10 flex items-center justify-center shrink-0">
          <ShoppingBag size={14} className="text-[#C5A26F]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#5C5249]">
            <span className="font-medium">Someone in {notification.location}</span>{" "}
            recently purchased
          </p>
          <p className="text-xs font-medium text-[#2C2522] mt-0.5 truncate">
            {notification.productName}
          </p>
          <p className="text-[10px] text-[#8A8178] mt-0.5">
            {notification.minutesAgo} {notification.minutesAgo === 1 ? "minute" : "minutes"} ago
          </p>
        </div>
        <button
          onClick={() => setNotification(null)}
          className="shrink-0 p-1 hover:bg-[#F5F0EA] rounded-full transition-colors"
        >
          <X size={12} className="text-[#8A8178]" />
        </button>
      </div>
    </div>
  );
}
