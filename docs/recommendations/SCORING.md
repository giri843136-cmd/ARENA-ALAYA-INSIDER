# Recommendation Scoring System

We use a **composite weighted score** (0-100).

## Default Weights (tunable in code)
- Editorial: 35%
- Behavioral: 25%
- Popularity: 15%
- Trending: 10%
- Affinity: 8%
- Freshness: 3%
- Seasonality: 2%
- Similarity: 1%
- Search: 1%

## Boosts Applied After Scoring
- Editorial picks get +15%
- Strong behavioral signals +12%
- Trending items +8%
- Heavy freshness decay on items > 2 years old

## Diversification
After scoring we apply light diversification to avoid showing 8 items from the same brand or universe in the first page of results.
