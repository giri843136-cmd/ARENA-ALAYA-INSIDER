import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },

  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    // In dev mode, CSP must allow inline scripts/evals for HMR and source maps
    const scriptSrc = isDev
      ? "'self' 'unsafe-inline' 'unsafe-eval'"
      : "'self' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://cdn.vercel-insights.com";

    const connectSrc = isDev
      ? "'self'"
      : "'self' https://api.resend.com https://o*.ingest.sentry.io https://www.google-analytics.com https://vitals.vercel-insights.com";

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
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://*.cloudinary.com https://images.unsplash.com https://www.google-analytics.com; font-src 'self' https://fonts.gstatic.com data:; connect-src ${connectSrc} https://open.er-api.com; frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests; report-uri /api/csp-violation`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;


