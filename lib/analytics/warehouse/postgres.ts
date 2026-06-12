/**
 * Current warehouse strategy: heavily optimized Postgres.
 * Partitioned events table + materialized views.
 * Ready for ClickHouse / BigQuery migration.
 */

export const WAREHOUSE_STRATEGY = {
  current: "postgres_partitioned",
  future: ["clickhouse_olap", "bigquery", "snowflake"],
  partitioning: {
    analytics_events: "by month on timestamp",
    price_history: "by month",
    activity_logs: "by month",
  },
  materializedViews: [
    "daily_revenue_by_network",
    "weekly_user_cohorts",
    "content_performance_30d",
    "ai_cost_by_agent",
  ],
  retention: {
    raw_events: "13 months",
    aggregations: "7 years",
    user_events: "anonymized after 24 months",
  },
};
