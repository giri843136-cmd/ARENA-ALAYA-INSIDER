import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TypeScript checking during build (handled separately via npm run typecheck)
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    if (config.resolve?.alias) {
      config.resolve.alias["@"] = __dirname;
    }
    return config;
  },
  // Production optimizations
  output: 'standalone',                // Required for Docker (copies .next/standalone/)
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },

  // Security & performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://cdn.vercel-insights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://*.cloudinary.com https://images.unsplash.com https://www.google-analytics.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://api.resend.com https://o*.ingest.sentry.io https://www.google-analytics.com https://vitals.vercel-insights.com; frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests; report-uri /api/csp-violation",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
