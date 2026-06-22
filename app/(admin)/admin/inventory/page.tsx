"use client";

import React from "react";
import { InventoryPredictionWidget } from "@/components/admin/widgets/InventoryPredictionWidget";
import { Package, TrendingUp, BarChart3 } from "lucide-react";

export default function InventoryPage() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Package size={14} /> INVENTORY
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Inventory Predictions</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">
              AI-powered inventory forecasting, stockout predictions, and replenishment recommendations.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <InventoryPredictionWidget />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="admin-card p-5 border border-[var(--admin-border)]">
            <div className="flex items-start gap-3">
              <TrendingUp size={16} className="text-[var(--admin-accent)] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium mb-2">How It Works</h3>
                <ul className="space-y-1 text-[10px] text-[var(--admin-text-secondary)]">
                  <li>• Analyzes historical affiliate click data as demand proxy</li>
                  <li>• Factors in seasonality based on product category</li>
                  <li>• Calculates dynamic reorder points with safety stock</li>
                  <li>• Generates restock alerts for stockout risks</li>
                  <li>• Detects demand velocity changes (growing/stable/declining)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="admin-card p-5 border border-[var(--admin-border)]">
            <div className="flex items-start gap-3">
              <BarChart3 size={16} className="text-[var(--admin-accent)] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium mb-2">Data Sources</h3>
                <ul className="space-y-1 text-[10px] text-[var(--admin-text-secondary)]">
                  <li>• Affiliate click analytics events</li>
                  <li>• Product inventory levels in database</li>
                  <li>• Price history for elasticity estimation</li>
                  <li>• Seasonality patterns from category metadata</li>
                  <li>• Merchant APIs (future: real-time stock sync)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
