# Warehousing Strategy

Today:
- Partitioned Postgres tables for events
- Materialized views for common queries (daily revenue, cohorts, content performance)
- Snapshots for historical accuracy

Tomorrow (when volume justifies):
- ClickHouse for fast OLAP
- BigQuery or Snowflake for finance-grade BI and long-term storage
- dbt for transformations
- Airflow / Inngest for orchestration

Migration path is designed to be incremental with zero data loss.
