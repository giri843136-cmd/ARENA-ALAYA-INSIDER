// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Social Proof Config Tests
 *
 * Tests the client-side A/B testing config module which uses localStorage
 * for storing signal toggle states and dispatches events for real-time updates.
 */

describe("SocialProof Config", () => {
  let config: typeof import("@/lib/social/config");
  let store: Record<string, string> = {};

  beforeEach(async () => {
    store = {};
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key: string) => store[key] ?? null
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(
      (key: string, value: string) => { store[key] = value; }
    );
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(
      (key: string) => { delete store[key]; }
    );
    vi.spyOn(window, "dispatchEvent").mockImplementation(vi.fn());

    vi.resetModules();
    config = await import("@/lib/social/config");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("DEFAULT_CONFIG", () => {
    it("has all three signals enabled by default", () => {
      expect(config.DEFAULT_CONFIG.viewersEnabled).toBe(true);
      expect(config.DEFAULT_CONFIG.purchasesEnabled).toBe(true);
      expect(config.DEFAULT_CONFIG.savesEnabled).toBe(true);
    });
  });

  describe("getSocialProofConfig", () => {
    it("returns defaults when nothing is stored", () => {
      const result = config.getSocialProofConfig();
      expect(result).toEqual(config.DEFAULT_CONFIG);
    });

    it("returns stored values when present", () => {
      store["alaya_social_proof_config"] = JSON.stringify({
        viewersEnabled: false, purchasesEnabled: true, savesEnabled: false,
      });

      const result = config.getSocialProofConfig();
      expect(result.viewersEnabled).toBe(false);
      expect(result.purchasesEnabled).toBe(true);
      expect(result.savesEnabled).toBe(false);
    });

    it("falls back to defaults for missing fields in stored config", () => {
      store["alaya_social_proof_config"] = JSON.stringify({ savesEnabled: false });

      const result = config.getSocialProofConfig();
      expect(result.viewersEnabled).toBe(true);
      expect(result.purchasesEnabled).toBe(true);
      expect(result.savesEnabled).toBe(false);
    });

    it("returns defaults on corrupted data", () => {
      store["alaya_social_proof_config"] = "not valid json{{{";
      const result = config.getSocialProofConfig();
      expect(result).toEqual(config.DEFAULT_CONFIG);
    });
  });

  describe("updateSocialProofConfig", () => {
    it("updates a single field", () => {
      const result = config.updateSocialProofConfig({ viewersEnabled: false });
      expect(result.viewersEnabled).toBe(false);
      expect(result.purchasesEnabled).toBe(true);
      expect(result.savesEnabled).toBe(true);
    });

    it("persists updated config to localStorage", () => {
      config.updateSocialProofConfig({ viewersEnabled: false, savesEnabled: false });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "alaya_social_proof_config",
        expect.any(String)
      );
      const parsed = JSON.parse(store["alaya_social_proof_config"]);
      expect(parsed.viewersEnabled).toBe(false);
      expect(parsed.savesEnabled).toBe(false);
      expect(parsed.purchasesEnabled).toBe(true);
    });

    it("dispatches a config-updated event", () => {
      config.updateSocialProofConfig({ viewersEnabled: false });

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: "social-proof-config-updated" })
      );
    });
  });

  describe("resetSocialProofConfig", () => {
    it("returns the default config", () => {
      config.updateSocialProofConfig({ viewersEnabled: false, savesEnabled: false });
      const result = config.resetSocialProofConfig();
      expect(result).toEqual(config.DEFAULT_CONFIG);
    });

    it("removes the stored config from localStorage", () => {
      config.updateSocialProofConfig({ viewersEnabled: false });
      config.resetSocialProofConfig();

      expect(localStorage.removeItem).toHaveBeenCalledWith("alaya_social_proof_config");
    });

    it("dispatches a config-updated event with defaults", () => {
      config.resetSocialProofConfig();

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "social-proof-config-updated",
          detail: config.DEFAULT_CONFIG,
        })
      );
    });
  });
});
