/**
 * ALAYA INSIDER — Affiliate Fraud Protection
 * Honeypot links, click anomaly detection, bot blocking
 * Real-time protection against click fraud, scraping, referrer spam
 */

import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

// =============================================
// HONEYPOT SYSTEM
// =============================================

// Hidden honeypot links that real users never see but bots/scrapers will follow
const HONEYPOT_PATHS = [
  "/go/affiliate/amazon/hidden-offer",
  "/go/out/special-promo",
  "/tracking/secret-deal",
  "/api/affiliate/bonus-link",
  "/hidden-partner-offer",
];

// Honeypot cookie names (set when a honeypot is "clicked")
const _HONEYPOT_COOKIE = "__alaya_honeypot";

/**
 * Generate a honeypot link (invisible to real users)
 * Returns the path and a signed token for verification
 */
export function generateHoneypotLink(): { path: string; token: string } {
  const path = HONEYPOT_PATHS[Math.floor(Math.random() * HONEYPOT_PATHS.length)];
  const token = crypto.randomBytes(16).toString("hex");
  const signature = crypto
    .createHmac("sha256", process.env.NEXTAUTH_SECRET || "honeypot-secret")
    .update(`${path}:${token}`)
    .digest("hex");

  return { path: `${path}?hp=${token}&sig=${signature}`, token };
}

/**
 * Verify if a request hit a honeypot
 * If yes, the requester is a bot/scraper
 */
export function isHoneypotHit(path: string, token: string, signature: string): boolean {
  const expectedSig = crypto
    .createHmac("sha256", process.env.NEXTAUTH_SECRET || "honeypot-secret")
    .update(`${path}:${token}`)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
}

// =============================================
// CLICK ANOMALY DETECTION
// =============================================

interface ClickEvent {
  ip: string;
  userAgent: string;
  productId?: string;
  timestamp: Date;
  geo?: string;
}

// In-memory click tracker (use Redis in production)
const clickHistory = new Map<string, { count: number; firstClick: Date; lastClick: Date; uaSet: Set<string> }>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const cutoff = Date.now() - 60 * 60 * 1000; // 1 hour
  for (const [ip, record] of clickHistory) {
    if (record.lastClick.getTime() < cutoff) clickHistory.delete(ip);
  }
}, 600000);

/**
 * Detect click fraud based on velocity and patterns
 * Returns a fraud score (0 = clean, 1.0 = definitely fraud)
 */
export async function detectClickFraud(event: ClickEvent): Promise<number> {
  const ip = event.ip;
  let fraudScore = 0;

  // Update click history
  const record = clickHistory.get(ip) || {
    count: 0,
    firstClick: event.timestamp,
    lastClick: event.timestamp,
    uaSet: new Set<string>(),
  };

  record.count++;
  record.lastClick = event.timestamp;
  record.uaSet.add(event.userAgent);
  clickHistory.set(ip, record);

  // === SIGNAL 1: High velocity (> 20 clicks per minute) ===
  const elapsedSeconds =
    (record.lastClick.getTime() - record.firstClick.getTime()) / 1000;
  if (elapsedSeconds > 0) {
    const cps = record.count / elapsedSeconds;
    if (cps > 0.33) fraudScore += 0.4; // >20 clicks/min
    if (cps > 1) fraudScore += 0.3; // >60 clicks/min
  }

  // === SIGNAL 2: Multiple user agents from same IP ===
  if (record.uaSet.size > 3) fraudScore += 0.3;

  // === SIGNAL 3: Missing or suspicious User-Agent ===
  if (!event.userAgent || event.userAgent.length < 10) fraudScore += 0.3;
  if (/python-requests|curl|wget|scrapy|java/i.test(event.userAgent)) {
    fraudScore += 0.5;
  }

  // === SIGNAL 4: Same product rapid clicks ===
  if (event.productId) {
    const _recentClicks = await prisma.affiliateLink.count({
      where: {
        product: { slug: event.productId },
        clicks: { gte: 50 }, // If link has many clicks, check velocity
      },
    });
  }

  // === SIGNAL 5: Geo-velocity (same IP clicking from different geo in <1s) ===
  if (event.geo) {
    // In production, check if IP appears in multiple geo locations
    // This requires a geo-IP database lookup
  }

  // Cap at 1.0
  return Math.min(fraudScore, 1.0);
}

/**
 * Check if a click should be blocked based on fraud score
 */
export function shouldBlockClick(fraudScore: number): boolean {
  return fraudScore >= 0.7; // Block if >70% likely fraud
}

/**
 * Log a fraudulent click for analysis
 */
export async function logFraudulentClick(
  event: ClickEvent,
  fraudScore: number,
  reason: string
): Promise<void> {
  try {
    await prisma.securityAuditLog.create({
      data: {
        action: "affiliate_fraud_detected",
        details: JSON.stringify({
          ip: event.ip,
          userAgent: event.userAgent,
          productId: event.productId,
          fraudScore,
          reason,
          uaCount: clickHistory.get(event.ip)?.uaSet.size || 0,
          clickCount: clickHistory.get(event.ip)?.count || 0,
        }),
        ipAddress: event.ip,
        severity: fraudScore >= 0.9 ? "critical" : "warning",
      },
    });
  } catch {
    // Non-critical — never throw
  }
}

// =============================================
// REFERRER SPAM BLOCKING
// =============================================

const SPAM_REFERRER_DOMAINS = [
  "semalt.com",
  "buttons-for-website.com",
  "make-money-online.xyz",
  "best-seo-offer.com",
  "site-reviews.xyz",
  "free-share-buttons.com",
  "share-buttons.xyz",
  "googlsucks.com",
  "bestwebsitesawards.com",
  "site-seo-analysis.com",
  "priceg.com",
  "blackhatworth.com",
  "hulfingtonpost.com",
  "o-o-6-o-o.com",
  "social-buttons.com",
  "simple-share-buttons.com",
  "shopping.7m.pl",
  "adspaces.network",
  "gamersworld.com",
  "buttons-for-website.net",
];

/**
 * Check if a referrer is known spam
 */
export function isSpamReferrer(referer: string | null): boolean {
  if (!referer) return false;

  try {
    const url = new URL(referer);
    return SPAM_REFERRER_DOMAINS.some(
      (spam) => url.hostname.includes(spam) || url.hostname === spam
    );
  } catch {
    return false;
  }
}

// =============================================
// BOT DETECTION
// =============================================

const KNOWN_BOTS = [
  "googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider",
  "yandexbot", "facebookexternalhit", "twitterbot", "applebot",
  "whatsapp", "slackbot", "discordbot", "telegrambot",
];

// Suspicious patterns (scrapers, SEO spam tools)
const SUSPICIOUS_PATTERNS = [
  /python-requests/i,
  /curl\//i,
  /wget\//i,
  /scrapy/i,
  /java\/[\d.]+/i,
  /ruby/i,
  /go-http-client/i,
  /php\/[\d.]+/i,
  /perl\//i,
  /libwww/i,
  /httpclient/i,
  /okhttp/i,
  /ahrefsbot/i,
  /majestic/i,
  /robot.*spider/i,
  /dataforseo/i,
  /semrush/i,
  /siteaudit/i,
  /moz/i,
  /spyfu/i,
];

/**
 * Classify a user agent
 * Returns 'bot', 'scraper', or 'human'
 */
export function classifyUserAgent(ua: string): "bot" | "scraper" | "human" {
  if (!ua || ua.length < 5) return "scraper";

  // Known search engine bots (should be allowed)
  const uaLower = ua.toLowerCase();
  for (const bot of KNOWN_BOTS) {
    if (uaLower.includes(bot)) return "bot";
  }

  // Suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(ua)) return "scraper";
  }

  return "human";
}

/**
 * Get all honeypot paths (for embedding in pages)
 */
export function getHoneypotPaths(): string[] {
  return HONEYPOT_PATHS;
}
