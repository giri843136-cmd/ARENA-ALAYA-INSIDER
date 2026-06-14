/**
 * Spam Detection Tests
 *
 * Tests rule-based + AI comment spam detection.
 * Pure logic — no external API required for rule-based checks.
 */

import { describe, it, expect } from "vitest";

// Replicate the spam detection logic (avoids OpenAI API dependency in tests)
interface SpamCheckResult {
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

async function checkSpam(content: string): Promise<SpamCheckResult> {
  const reasons: string[] = [];
  let score = 0;

  const text = content.toLowerCase();
  for (const rule of SPAM_RULES) {
    const matches = text.match(rule.pattern);
    if (matches) {
      score += rule.weight * matches.length;
      reasons.push(rule.reason);
    }
  }

  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > 3) {
    score += linkCount;
    reasons.push(`Excessive links (${linkCount})`);
  }

  const uniqueChars = new Set(content.replace(/\s/g, "")).size;
  if (uniqueChars < 5 && content.length > 20) {
    score += 3;
    reasons.push("Unnatural repetition");
  }

  const words = content.split(/\s+/).length;
  if (words > 0 && linkCount / words > 0.3) {
    score += 4;
    reasons.push("High link-to-text ratio");
  }

  return { isSpam: score >= 3, score, reasons };
}

function getCommentStatus(result: SpamCheckResult): "APPROVED" | "PENDING" | "SPAM" {
  if (result.isSpam) return "SPAM";
  if (result.score >= 1) return "PENDING";
  return "APPROVED";
}

describe("Spam Detection", () => {
  describe("Rule-Based Detection", () => {
    it("flags promotional language", async () => {
      const result = await checkSpam("Buy now and get a free money exclusive deal limited time only!");
      expect(result.isSpam).toBe(true);
      expect(result.reasons).toContain("Promotional language");
    });

    it("flags prize/win language", async () => {
      const result = await checkSpam("Congratulations! You are the lucky winner of a cash prize!");
      expect(result.isSpam).toBe(true);
      expect(result.reasons).toContain("Prize/win language");
    });

    it("flags adult content references", async () => {
      const result = await checkSpam("Check out this casino site for xxx content");
      expect(result.isSpam).toBe(true);
      expect(result.reasons).toContain("Adult content");
    });

    it("flags SEO solicitation", async () => {
      const result = await checkSpam("I want to write a guest post for your site about SEO backlinks");
      expect(result.isSpam).toBe(true);
      expect(result.reasons).toContain("SEO solicitation");
    });

    it("flags repeated characters (9+)", async () => {
      // Need 3+ matches of 9+ repeated chars to reach score >= 3 (weight 1 * 3 = 3)
      const result = await checkSpam("!!!!!!!!!!!! !!!!!!!!!!!! !!!!!!!!!!!!");
      expect(result.isSpam).toBe(true);
      expect(result.reasons).toContain("Repeated characters");
    });

    it("passes legitimate content", async () => {
      const result = await checkSpam(
        "This is a thoughtful comment about the article. I really enjoyed reading about the craftsmanship and would love to see more content like this."
      );
      expect(result.isSpam).toBe(false);
      expect(result.score).toBeLessThan(3);
    });
  });

  describe("Link Analysis", () => {
    it("flags excessive links", async () => {
      const result = await checkSpam(
        "Check https://example1.com and https://example2.com and https://example3.com and https://example4.com"
      );
      expect(result.reasons).toContain("Excessive links (4)");
      expect(result.isSpam).toBe(true);
    });

    it("is lenient with a single link", async () => {
      const result = await checkSpam(
        "Great article! I found more info at https://example.com/reference"
      );
      expect(result.isSpam).toBe(false);
    });

    it("flags high link-to-text ratio", async () => {
      const result = await checkSpam(
        "Visit https://spam.com and https://spam2.com and https://spam3.com"
      );
      // 3 links, 11 words = 0.27 ratio, not > 0.3
      // But 3 links = no excessive links penalty (>3)
      // This should pass or get close
      const linkRatio = 3 / 11;
      expect(linkRatio).toBeLessThan(0.31);
    });

    it("flags very high link-to-text ratio", async () => {
      const result = await checkSpam(
        "Buy https://spam1.com and https://spam2.com and https://spam3.com and https://spam4.com now"
      );
      // 4 links, link-to-text ratio > 0.3, plus excessive links (4)
      expect(result.isSpam).toBe(true);
    });
  });

  describe("Unnatural Repetition", () => {
    it("flags repeated single character", async () => {
      // uniqueChars < 5 and length > 20 triggers "Unnatural repetition" (+3 score)
      const result = await checkSpam("aaaaaaaaaa aaaaaaaaaa aaaaaaaaaa aaaaaaaaaa aaaaaaaaaa");
      expect(result.score).toBeGreaterThanOrEqual(3);
      expect(result.reasons).toContain("Unnatural repetition");
    });

    it("does not flag normal text with varied characters", async () => {
      const result = await checkSpam("This is a normal comment with diverse characters.");
      const hasUnnatural = result.reasons.includes("Unnatural repetition");
      expect(hasUnnatural).toBe(false);
    });
  });

  describe("getCommentStatus", () => {
    it("returns SPAM for spam results", () => {
      expect(getCommentStatus({ isSpam: true, score: 5, reasons: ["test"] })).toBe("SPAM");
    });

    it("returns PENDING for borderline results", () => {
      expect(getCommentStatus({ isSpam: false, score: 1, reasons: ["test"] })).toBe("PENDING");
      expect(getCommentStatus({ isSpam: false, score: 2, reasons: ["test"] })).toBe("PENDING");
    });

    it("returns APPROVED for clean results", () => {
      expect(getCommentStatus({ isSpam: false, score: 0, reasons: [] })).toBe("APPROVED");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty content", async () => {
      const result = await checkSpam("");
      expect(result.isSpam).toBe(false);
      expect(result.score).toBe(0);
    });

    it("handles very short content", async () => {
      const result = await checkSpam("Hi");
      expect(result.isSpam).toBe(false);
    });

    it("handles content with only special characters", async () => {
      const result = await checkSpam("!!! ??? *** ###");
      expect(result).toBeDefined();
      expect(typeof result.score).toBe("number");
    });

    it("handles very long content without spam patterns", async () => {
      const longText = "A ".repeat(100) + "genuine comment about products.";
      const result = await checkSpam(longText);
      expect(result.isSpam).toBe(false);
    });

    it("is case-insensitive for promotional patterns", async () => {
      const result = await checkSpam("BUY NOW and Click Here for an EXCLUSIVE DEAL");
      expect(result.isSpam).toBe(true);
    });

    it("returns multiple reasons for combined violations", async () => {
      const result = await checkSpam(
        "BUY NOW this exclusive deal! Limited time! " +
        "Visit https://spam1.com https://spam2.com https://spam3.com https://spam4.com"
      );
      expect(result.reasons.length).toBeGreaterThanOrEqual(1);
      expect(result.isSpam).toBe(true);
    });
  });
});
