"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface ForecastData {
  totalProjectedRevenue: number;
  forecastPeriod: { start: string; end: string };
  confidence: { lower: number; upper: number; level: number };
  byChannel: { channel: string; projectedRevenue: number; growthRate: number; share: number }[];
  methodology: string;
}

interface TimeSeriesPoint {
  date: string;
  type: "historical" | "forecast";
  value: number;
  lower?: number;
  upper?: number;
}

/**
 * RevenueForecastWidget — Admin dashboard widget showing projected revenue
 * with confidence intervals, channel breakdown, and time series chart.
 */
export function RevenueForecastWidget() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [timeSeries, setTimeSeries] = useState<{ historical: TimeSeriesPoint[]; forecast: TimeSeriesPoint[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/revenue/forecast?historicalDays=90&forecastDays=30");
      const json = await res.json();
      if (json.success) {
        setForecast(json.data.forecast);
        setTimeSeries(json.data.timeSeries);
      } else {
        setError(json.error?.message || "Failed to load forecast");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchData();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [fetchData]);

  if (loading && !forecast) {
    return (
      <div className="widget">
        <div className="flex items-center justify-between mb-4">
          <div className="widget-title flex items-center gap-2">
            <BarChart3 size={14} /> REVENUE FORECAST
          </div>
        </div>
        <div className="flex items-center justify-center py-10">
          <Loader2 size={18} className="animate-spin text-[var(--admin-accent)]" />
          <span className="text-xs text-[var(--admin-text-secondary)] ml-2">Generating forecast...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget">
        <div className="flex items-center justify-between mb-4">
          <div className="widget-title flex items-center gap-2">
            <BarChart3 size={14} /> REVENUE FORECAST
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#F87171]/5 border border-[#F87171]/20">
          <div className="flex items-center gap-2 text-xs text-[#F87171]">
            <AlertTriangle size={14} />
            {error}
          </div>
          <button onClick={fetchData} className="text-xs text-[var(--admin-accent)] hover:underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!forecast) return null;

  const totalRevenue = forecast.totalProjectedRevenue;
  const confidenceUpper = forecast.confidence.upper;
  const confidenceLower = forecast.confidence.lower;
  const rangeWidth = ((confidenceUpper - confidenceLower) / totalRevenue) * 100;

  return (
    <div className="widget">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="widget-title flex items-center gap-2">
          <BarChart3 size={14} /> REVENUE FORECAST
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Main forecast card */}
      <div className="bg-[var(--admin-bg-subtle)] rounded-xl border border-[var(--admin-border)] p-5 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[10px] tracking-wider text-[var(--admin-text-muted)] mb-1">
              PROJECTED REVENUE — NEXT 30 DAYS
            </div>
            <div className="text-3xl font-semibold tabular-nums text-[#4ADE80]">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--admin-text-muted)]">
            <Calendar size={12} />
            {forecast.forecastPeriod.start} – {forecast.forecastPeriod.end}
          </div>
        </div>

        {/* Confidence interval bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-[var(--admin-text-muted)] mb-1">
            <span>80% Confidence Interval</span>
            <span>${confidenceLower.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} – ${confidenceUpper.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--admin-border)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FBBF24]/60 via-[#4ADE80] to-[#FBBF24]/60"
              style={{ width: `${Math.min(100, rangeWidth)}%`, marginLeft: `${Math.max(0, (totalRevenue - confidenceLower) / (confidenceUpper - confidenceLower) * 100 - rangeWidth / 2)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[var(--admin-text-muted)] mt-1">
            <span>Pessimistic</span>
            <span className="text-[var(--admin-text-secondary)]">Most Likely</span>
            <span>Optimistic</span>
          </div>
        </div>
      </div>

      {/* Channel breakdown */}
      <div className="mb-4">
        <div className="text-[10px] tracking-wider text-[var(--admin-text-muted)] mb-3">
          FORECAST BY CHANNEL
        </div>
        <div className="space-y-2">
          {forecast.byChannel.map((channel) => (
            <div key={channel.channel} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--admin-bg-hover)] transition-colors">
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium">{channel.channel}</div>
                <div className={`flex items-center gap-0.5 text-[10px] ${channel.growthRate >= 0 ? "text-[#4ADE80]" : "text-[#F87171]"}`}>
                  {channel.growthRate >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {Math.abs(channel.growthRate).toFixed(1)}%
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs tabular-nums font-medium">
                  ${channel.projectedRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] text-[var(--admin-text-muted)] w-8 text-right">
                  {channel.share.toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
          {forecast.byChannel.length === 0 && (
            <div className="text-xs text-[var(--admin-text-muted)] text-center py-3">
              No channel data available yet
            </div>
          )}
        </div>
      </div>

      {/* Time series mini-chart (ASCII/bars) */}
      {timeSeries && timeSeries.forecast.length > 0 && (
        <div className="border-t border-[var(--admin-border)] pt-4">
          <div className="text-[10px] tracking-wider text-[var(--admin-text-muted)] mb-3">
            DAILY FORECAST TREND
          </div>
          <div className="flex items-end gap-1 h-24">
            {timeSeries.forecast.slice(0, 30).map((point, i) => {
              const maxVal = Math.max(...timeSeries.forecast.map((p) => p.upper || p.value));
              const height = maxVal > 0 ? (point.value / maxVal) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5 group relative">
                  {/* Confidence band */}
                  <div
                    className="w-full rounded-t opacity-20 bg-[#C5A26F] transition-all"
                    style={{ height: `${Math.max(3, height)}%`, minHeight: "2px" }}
                    title={`${point.date}: $${point.value.toLocaleString()}`}
                  />
                  {/* Bar itself */}
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-[#C5A26F] to-[#D4B88C] transition-all hover:opacity-80 cursor-pointer"
                    style={{ height: `${Math.max(4, height * 0.7)}%`, minHeight: "3px" }}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#161616] border border-[#252525] rounded-md px-2 py-1 text-[9px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {point.date}: ${point.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[9px] text-[var(--admin-text-muted)] mt-1">
            <span>{timeSeries.forecast[0]?.date}</span>
            <span>{timeSeries.forecast[Math.min(14, timeSeries.forecast.length - 1)]?.date}</span>
            <span>{timeSeries.forecast[timeSeries.forecast.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-[var(--admin-border)] pt-3 mt-4">
        <div className="text-[9px] text-[var(--admin-text-muted)] leading-relaxed">
          {forecast.methodology}
        </div>
      </div>
    </div>
  );
}
