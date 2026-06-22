"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Package, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Minus, Clock, RefreshCw, Loader2, BarChart3
} from "lucide-react";

interface InventoryPrediction {
  productId: string;
  productName: string;
  productSlug: string;
  currentStock: number | null;
  dailySalesRate: number;
  daysUntilOutOfStock: number | null;
  predictedStockoutDate: string | null;
  reorderPoint: number;
  confidence: "high" | "medium" | "low";
  factors: {
    salesVelocity: "increasing" | "stable" | "declining";
    seasonality: string | null;
    trend: number;
    priceElasticity: number;
  };
  recommendations: string[];
}

interface InventorySummary {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  predictedStockouts: number;
  averageRestockDays: number;
  lastUpdated: string;
}

const VELOCITY_ICONS: Record<string, typeof TrendingUp> = {
  increasing: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
};

const VELOCITY_COLORS: Record<string, string> = {
  increasing: "#4ADE80",
  stable: "#FBBF24",
  declining: "#F87171",
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "#4ADE80",
  medium: "#FBBF24",
  low: "#F87171",
};

export function InventoryPredictionWidget() {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [predictions, setPredictions] = useState<InventoryPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"summary" | "details">("summary");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, lowStockRes] = await Promise.all([
        fetch("/api/v1/admin/inventory/predictions?mode=summary"),
        fetch("/api/v1/admin/inventory/predictions?mode=low-stock"),
      ]);
      const summaryJson = await summaryRes.json();
      const lowStockJson = await lowStockRes.json();
      if (summaryJson.success) setSummary(summaryJson.data);
      if (lowStockJson.success) setPredictions(lowStockJson.data);
    } catch { /* graceful */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { /* eslint-disable react-hooks/set-state-in-effect */ fetchData(); /* eslint-enable react-hooks/set-state-in-effect */ }, [fetchData]);

  if (loading && !summary) {
    return (
      <div className="widget flex items-center justify-center py-12">
        <Loader2 size={18} className="animate-spin text-[var(--admin-accent)]" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="widget text-center py-8 text-xs text-[var(--admin-text-muted)]">
        Unable to load inventory data
      </div>
    );
  }

  return (
    <div className="widget">
      <div className="widget-title flex items-center justify-between mb-4">
        <span className="flex items-center gap-2">
          <Package size={14} /> INVENTORY PREDICTIONS
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(view === "summary" ? "details" : "summary")}
            className="text-[10px] text-[var(--admin-accent)] hover:underline"
          >
            {view === "summary" ? "View Details" : "Summary"}
          </button>
          <button onClick={fetchData} disabled={loading} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {view === "summary" ? (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 rounded-xl bg-[#4ADE80]/5 border border-[#4ADE80]/20">
              <div className="text-xs text-[var(--admin-text-muted)]">In Stock</div>
              <div className="text-xl font-semibold tabular-nums text-[#4ADE80]">{summary.inStock}</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-[#FBBF24]/5 border border-[#FBBF24]/20">
              <div className="text-xs text-[var(--admin-text-muted)]">Low Stock</div>
              <div className="text-xl font-semibold tabular-nums text-[#FBBF24]">{summary.lowStock}</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-[#F87171]/5 border border-[#F87171]/20">
              <div className="text-xs text-[var(--admin-text-muted)]">Out of Stock</div>
              <div className="text-xl font-semibold tabular-nums text-[#F87171]">{summary.outOfStock}</div>
            </div>
          </div>

          {/* Predictions bar */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--admin-bg-subtle)] border border-[var(--admin-border)]">
            <BarChart3 size={14} className="text-[var(--admin-accent)]" />
            <div className="flex-1">
              <div className="text-xs font-medium">
                {summary.predictedStockouts} products predicted to stock out in 30 days
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 flex-1 rounded-full bg-[var(--admin-border)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#F87171]"
                    style={{ width: `${summary.totalProducts > 0 ? (summary.predictedStockouts / summary.totalProducts) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[10px] text-[var(--admin-text-muted)]">
                  {summary.totalProducts > 0
                    ? ((summary.predictedStockouts / summary.totalProducts) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Last updated */}
          <div className="mt-3 text-[9px] text-[var(--admin-text-muted)] flex items-center gap-1">
            <Clock size={9} />
            Updated {summary.lastUpdated ? new Date(summary.lastUpdated).toLocaleString() : "N/A"}
          </div>
        </>
      ) : (
        <>
          {/* Detailed predictions */}
          {predictions.length === 0 ? (
            <div className="text-center py-8 text-xs text-[var(--admin-text-muted)]">
              <CheckCircle size={24} className="mx-auto mb-2 text-[#4ADE80]" />
              No low-stock predictions
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {predictions.slice(0, 20).map((pred) => {
                const VelocityIcon = VELOCITY_ICONS[pred.factors.salesVelocity] || Minus;
                const velocityColor = VELOCITY_COLORS[pred.factors.salesVelocity] || "#666";

                return (
                  <div key={pred.productId} className="p-3 rounded-lg border border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)] transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <a href={`/admin/products/${pred.productId}`} className="text-xs font-medium hover:text-[var(--admin-accent)] truncate block">
                          {pred.productName}
                        </a>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-semibold tabular-nums ${
                            pred.currentStock !== null && pred.currentStock <= pred.reorderPoint
                              ? "text-[#F87171]"
                              : "text-[var(--admin-text-secondary)]"
                          }`}>
                            Stock: {pred.currentStock ?? "N/A"}
                          </span>
                          <span className="text-[10px] text-[var(--admin-text-muted)]">
                            Reorder at: {pred.reorderPoint}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {pred.daysUntilOutOfStock !== null && (
                          <div className={`text-xs font-semibold tabular-nums ${
                            pred.daysUntilOutOfStock <= 7
                              ? "text-[#F87171]"
                              : pred.daysUntilOutOfStock <= 14
                                ? "text-[#FBBF24]"
                                : "text-[#4ADE80]"
                          }`}>
                            {pred.daysUntilOutOfStock}d left
                          </div>
                        )}
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          <VelocityIcon size={10} style={{ color: velocityColor }} />
                          <span className="text-[9px] text-[var(--admin-text-muted)]">
                            {pred.dailySalesRate.toFixed(1)}/day
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Confidence bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-1 flex-1 rounded-full bg-[var(--admin-border)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pred.confidence === "high" ? 90 : pred.confidence === "medium" ? 60 : 30}%`,
                            backgroundColor: CONFIDENCE_COLORS[pred.confidence],
                          }}
                        />
                      </div>
                      <span className="text-[9px] text-[var(--admin-text-muted)] capitalize">{pred.confidence}</span>
                    </div>

                    {pred.recommendations.length > 0 && (
                      <div className="mt-2 text-[9px] text-[#F87171]">
                        {pred.recommendations[0]}
                      </div>
                    )}
                  </div>
                );
              })}
              {predictions.length > 20 && (
                <div className="text-center text-[10px] text-[var(--admin-text-muted)] py-2">
                  + {predictions.length - 20} more products
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
