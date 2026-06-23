import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript checking handled via `npm run typecheck` (separate from build)
  // Note: build was verified to pass without this flag
  // @ alias is resolved via tsconfig.json paths
  // webpack config removed — Turbopack (default in Next.js 16) doesn't support it
  // PoweredBy header disabled for security
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
          // COEP: require-corp would block external CDN resources (Unsplash, Cloudinary, Google Fonts, etc.)
          // CORP: same-origin would prevent loading external images/fonts needed by the site
          // COOP: relaxed to allow-popups for Google OAuth compatibility
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://cdn.vercel-insights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://*.cloudinary.com https://images.unsplash.com https://www.google-analytics.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://api.resend.com https://o*.ingest.sentry.io https://www.google-analytics.com https://vitals.vercel-insights.com; frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests; report-uri /api/csp-violation",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
