/**
 * ALAYA INSIDER — Spam Detection Service
 * Multi-layered: rule-based + OpenAI moderation + Akismet (optional)
 */

export interface SpamCheckResult {
  isSpam: boolean;
  score: number;
  reasons: string[];
}

const SPAM_RULES = [
  { pattern: /\b(buy now|click here|free money|earn fast|limited time|act now|exclusive deal)\b/i, weight: 2, reason: "Promotional language" },
  { pattern: /(.)\1{8,}/, weight: 1, reason: "Repeated characters" },
  { pattern: /\b(cash|prize|winner|congratulations|lucky)\b/i, weight: 1.5, reason: "Prize/win language" },
  { pattern: /\b(viagra|cialis|casino|porn|xxx)\b/i, weight: 5, reason: "Adult content" },
  { pattern: /\b(seo|backlink|guest post|write for us)\b/i, weight: 2, reason: "SEO solicitation" },
];

export async function checkSpam(
  content: string,
  options?: { useOpenAI?: boolean; useAkismet?: boolean }
): Promise<SpamCheckResult> {
  const reasons: string[] = [];
  let score = 0;

  // 1. Rule-based detection
  const text = content.toLowerCase();
  for (const rule of SPAM_RULES) {
    const matches = text.match(rule.pattern);
    if (matches) {
      score += rule.weight * matches.length;
      reasons.push(rule.reason);
    }
  }

  // 2. Link analysis
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > 3) {
    score += linkCount;
    reasons.push(`Excessive links (${linkCount})`);
  }

  // 3. Repeated text patterns
  const uniqueChars = new Set(content.replace(/\s/g, "")).size;
  if (uniqueChars < 5 && content.length > 20) {
    score += 3;
    reasons.push("Unnatural repetition");
  }

  // 4. Ratio of links to text
  const words = content.split(/\s+/).length;
  if (words > 0 && linkCount / words > 0.3) {
    score += 4;
    reasons.push("High link-to-text ratio");
  }

  // 5. OpenAI Moderation API (if enabled and API key exists)
  if (options?.useOpenAI !== false && process.env.OPENAI_API_KEY && score < 4) {
    try {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.moderations.create({ input: content });
      const result = response.results[0];
      if (result?.flagged) {
        score += 5;
        reasons.push("Flagged by OpenAI moderation");
        // Add specific categories
        for (const [cat, flagged] of Object.entries(result.categories)) {
          if (flagged) reasons.push(`OpenAI category: ${cat}`);
        }
      }
    } catch {}
  }

  return {
    isSpam: score >= 3,
    score,
    reasons,
  };
}

export function getCommentStatus(spamResult: SpamCheckResult): "APPROVED" | "PENDING" | "SPAM" {
  if (spamResult.isSpam) return "SPAM";
  if (spamResult.score >= 1) return "PENDING"; // Requires review
  return "APPROVED";
}
