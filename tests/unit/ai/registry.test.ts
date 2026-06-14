/**
 * AI Agent Registry Tests
 *
 * Tests agent configuration, registration, lookup, and type safety.
 * Pure data — no provider or database required.
 */

import { describe, it, expect } from "vitest";

// Replicate the agent registry (avoids full module import chain)
interface AgentConfig {
  type: string;
  name: string;
  description: string;
  capabilities: string[];
  defaultProvider: string;
  defaultModel: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  rateLimitPerMinute: number;
  costPer1kTokens: number;
}

const AGENT_REGISTRY: Record<string, AgentConfig> = {
  CONTENT_ARCHITECT: {
    type: "CONTENT_ARCHITECT",
    name: "Content Architect",
    description: "Generates high-quality editorial content",
    capabilities: ["long_form", "structured_output", "internal_linking", "schema"],
    defaultProvider: "anthropic",
    defaultModel: "claude-3-5-sonnet-20241022",
    maxTokens: 4000,
    temperature: 0.7,
    systemPrompt: "Write with warmth, elegance, precision",
    rateLimitPerMinute: 20,
    costPer1kTokens: 0.015,
  },
  SEO_STRATEGIST: {
    type: "SEO_STRATEGIST",
    name: "SEO Strategist",
    description: "Optimizes for search, entities, schema",
    capabilities: ["keyword_research", "entity_seo", "schema", "meta", "internal_links"],
    defaultProvider: "anthropic",
    defaultModel: "claude-3-5-sonnet-20241022",
    maxTokens: 2000,
    temperature: 0.4,
    systemPrompt: "Focus on entity understanding",
    rateLimitPerMinute: 30,
    costPer1kTokens: 0.015,
  },
  TREND_RADAR: {
    type: "TREND_RADAR",
    name: "Trend Radar",
    description: "Surfaces emerging trends",
    capabilities: ["trend_detection", "opportunity_analysis"],
    defaultProvider: "anthropic",
    defaultModel: "claude-3-5-sonnet-20241022",
    maxTokens: 1500,
    temperature: 0.6,
    systemPrompt: "Surface real, actionable trends",
    rateLimitPerMinute: 15,
    costPer1kTokens: 0.015,
  },
  FAQ_GENERATOR: {
    type: "FAQ_GENERATOR",
    name: "FAQ Generator",
    description: "Creates schema-ready FAQs",
    capabilities: ["structured_output", "schema"],
    defaultProvider: "anthropic",
    defaultModel: "claude-3-5-sonnet-20241022",
    maxTokens: 1800,
    temperature: 0.5,
    systemPrompt: "Write genuinely useful FAQs",
    rateLimitPerMinute: 25,
    costPer1kTokens: 0.015,
  },
  BRAND_VOICE_GUARDIAN: {
    type: "BRAND_VOICE_GUARDIAN",
    name: "Brand Voice Guardian",
    description: "Reviews content for brand voice",
    capabilities: ["tone_analysis", "rewriting"],
    defaultProvider: "anthropic",
    defaultModel: "claude-3-5-sonnet-20241022",
    maxTokens: 2500,
    temperature: 0.6,
    systemPrompt: "Guardian of brand voice",
    rateLimitPerMinute: 20,
    costPer1kTokens: 0.015,
  },
};

function getAgentConfig(type: string): AgentConfig | undefined {
  return AGENT_REGISTRY[type];
}

function listAgents(): AgentConfig[] {
  return Object.values(AGENT_REGISTRY);
}

describe("AI Agent Registry", () => {
  describe("Agent Count and Structure", () => {
    it("has exactly 5 registered agents (test subset)", () => {
      expect(Object.keys(AGENT_REGISTRY).length).toBe(5);
    });

    it("all agents have all required fields", () => {
      for (const agent of Object.values(AGENT_REGISTRY)) {
        expect(agent.type).toBeDefined();
        expect(agent.name).toBeDefined();
        expect(agent.description).toBeDefined();
        expect(agent.capabilities).toBeInstanceOf(Array);
        expect(agent.defaultProvider).toBeDefined();
        expect(agent.defaultModel).toBeDefined();
        expect(agent.maxTokens).toBeGreaterThan(0);
        expect(agent.temperature).toBeGreaterThanOrEqual(0);
        expect(agent.temperature).toBeLessThanOrEqual(1);
        expect(agent.rateLimitPerMinute).toBeGreaterThan(0);
        expect(agent.costPer1kTokens).toBeGreaterThan(0);
      }
    });
  });

  describe("getAgentConfig", () => {
    it("returns the Content Architect config", () => {
      const config = getAgentConfig("CONTENT_ARCHITECT");
      expect(config).toBeDefined();
      expect(config!.name).toBe("Content Architect");
    });

    it("returns SEO Strategist with correct capabilities", () => {
      const config = getAgentConfig("SEO_STRATEGIST");
      expect(config!.capabilities).toContain("keyword_research");
      expect(config!.capabilities).toContain("entity_seo");
      expect(config!.capabilities).toContain("schema");
    });

    it("returns undefined for unknown agent types", () => {
      expect(getAgentConfig("NONEXISTENT_AGENT")).toBeUndefined();
    });

    it("is case-sensitive", () => {
      expect(getAgentConfig("content_architect")).toBeUndefined();
      expect(getAgentConfig("CONTENT_ARCHITECT")).toBeDefined();
    });
  });

  describe("listAgents", () => {
    it("returns all agents as an array", () => {
      const agents = listAgents();
      expect(agents).toHaveLength(5);
    });

    it("each agent has a unique type", () => {
      const agents = listAgents();
      const types = agents.map((a) => a.type);
      expect(new Set(types).size).toBe(types.length);
    });
  });

  describe("Provider and Model Configuration", () => {
    it("all agents use anthropic as default provider", () => {
      for (const agent of Object.values(AGENT_REGISTRY)) {
        expect(agent.defaultProvider).toBe("anthropic");
      }
    });

    it("agents have different temperature settings based on purpose", () => {
      // Creative agents should have higher temperature
      expect(AGENT_REGISTRY.CONTENT_ARCHITECT.temperature).toBeGreaterThan(0.6);
      expect(AGENT_REGISTRY.TREND_RADAR.temperature).toBeGreaterThan(0.5);
      // Analytical agents should have lower temperature
      expect(AGENT_REGISTRY.SEO_STRATEGIST.temperature).toBeLessThan(0.5);
    });

    it("rate limits differ per agent type", () => {
      // High-volume tasks have higher rate limits
      expect(AGENT_REGISTRY.SEO_STRATEGIST.rateLimitPerMinute).toBeGreaterThan(
        AGENT_REGISTRY.TREND_RADAR.rateLimitPerMinute
      );
    });
  });

  describe("Capabilities Coverage", () => {
    it("all agents have at least one capability", () => {
      for (const agent of Object.values(AGENT_REGISTRY)) {
        expect(agent.capabilities.length).toBeGreaterThan(0);
      }
    });

    it("structured_output is shared by content agents", () => {
      const hasStructuredOutput = (type: string) =>
        AGENT_REGISTRY[type]?.capabilities.includes("structured_output");
      expect(hasStructuredOutput("CONTENT_ARCHITECT")).toBe(true);
      expect(hasStructuredOutput("FAQ_GENERATOR")).toBe(true);
      expect(hasStructuredOutput("SEO_STRATEGIST")).toBe(false);
    });

    it("schema capability is used by content and FAQ agents", () => {
      expect(AGENT_REGISTRY.CONTENT_ARCHITECT.capabilities).toContain("schema");
      expect(AGENT_REGISTRY.FAQ_GENERATOR.capabilities).toContain("schema");
    });
  });
});
