// =============================================
// ALAYA INSIDER — K6 Load Test (1M DAU Simulation)
// Run: k6 run load-test-k6.js
// =============================================
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// === CONFIGURATION ===
export const options = {
  // Simulate 1M daily active users across peak hours
  // 1M DAU / 24h = ~11.5 req/s average
  // Peak: ~1000 concurrent users
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 500 },   // Ramp to 500
    { duration: '10m', target: 1000 },  // Peak load
    { duration: '5m', target: 1000 },   // Sustain peak
    { duration: '3m', target: 500 },    // Ramp down
    { duration: '2m', target: 0 },      // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],  // 95% under 2s, 99% under 5s
    http_req_failed: ['rate<0.01'],                     // <1% error rate
    checks: ['rate>0.99'],                             // 99% check pass rate
  },
};

// Custom metrics
const homePageDuration = new Trend('home_page_duration');
const searchDuration = new Trend('search_duration');
const productPageDuration = new Trend('product_page_duration');
const apiDuration = new Trend('api_duration');
const authDuration = new Trend('auth_duration');
const errorRate = new Rate('error_rate');

const BASE_URL = __ENV.BASE_URL || 'https://alayainsider.com';

// Sample search queries
const SEARCHES = [
  'skincare', 'kitchen', 'fashion', 'tech', 'travel',
  'yoga mat', 'coffee maker', 'silk pillowcase', 'dress', 'headphones',
  'organic', 'sustainable', 'luxury', 'gift', 'sale',
];

// Sample product slugs
const PRODUCTS = [
  'silk-pillowcase', 'yoga-mat', 'chemex-coffee-maker', 'cashmere-blanket',
  'dutch-oven', 'leather-tote', 'wireless-headphones', 'plant-based-skincare',
];

// =============================================
// SCENARIOS
// =============================================

export default function () {
  // User session: browse homepage → search → view product → check affiliate
  group('User Session', () => {
    // 1. Homepage
    group('Homepage', () => {
      const res = http.get(`${BASE_URL}/`);
      const result = check(res, {
        'homepage status 200': (r) => r.status === 200,
        'homepage loaded fast': (r) => r.timings.duration < 3000,
      });
      homePageDuration.add(res.timings.duration);
      if (!result) errorRate.add(1);
    });

    sleep(Math.random() * 3 + 1);

    // 2. Search (30% probability)
    if (Math.random() < 0.3) {
      group('Search', () => {
        const query = SEARCHES[Math.floor(Math.random() * SEARCHES.length)];
        const res = http.get(`${BASE_URL}/search?q=${encodeURIComponent(query)}`, {
          tags: { name: 'search' },
        });
        const result = check(res, {
          'search status 200': (r) => r.status === 200,
          'search returned results': (r) => r.body.length > 100,
        });
        searchDuration.add(res.timings.duration);
        if (!result) errorRate.add(1);
      });
    }

    sleep(Math.random() * 2 + 1);

    // 3. Product Page (40% probability)
    if (Math.random() < 0.4) {
      group('Product Page', () => {
        const slug = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
        const res = http.get(`${BASE_URL}/products/${slug}`);
        const result = check(res, {
          'product status 200': (r) => r.status === 200,
          'product loaded fast': (r) => r.timings.duration < 3000,
        });
        productPageDuration.add(res.timings.duration);
        if (!result) errorRate.add(1);
      });
    }

    sleep(Math.random() * 2 + 1);

    // 4. API Calls (20% probability)
    if (Math.random() < 0.2) {
      group('API', () => {
        const res = http.get(`${BASE_URL}/api/health`);
        const result = check(res, {
          'api health 200': (r) => r.status === 200,
        });
        apiDuration.add(res.timings.duration);
        if (!result) errorRate.add(1);
      });
    }

    sleep(Math.random() * 2 + 1);

    // 5. Affiliate Link Click (10% probability)
    if (Math.random() < 0.1) {
      group('Affiliate Click', () => {
        // Simulate affiliate link click with proper redirect chain
        const res = http.get(`${BASE_URL}/go/amazon/test-product`, {
          redirects: 0, // Don't follow affiliate redirects in test
          tags: { name: 'affiliate_click' },
        });
        // Affiliate clicks should redirect (301/302)
        const result = check(res, {
          'affiliate click redirects': (r) => r.status >= 301 && r.status <= 303,
        });
        if (!result) errorRate.add(1);
      });
    }
  });
}

// =============================================
// TEARDOWN (cleanup after test)
// =============================================
export function teardown() {
  console.log('Load test completed. Check k6 results for summary.');
}
