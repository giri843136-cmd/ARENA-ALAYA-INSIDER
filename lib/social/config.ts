/**
 * ALYA INSIDER — Social Proof A/B Testing Config
 *
 * Manages which social proof signals are shown on product pages.
 * Admins can toggle signals via localStorage, enabling A/B testing
 * to measure the impact of each signal on conversion.
 *
 * Each signal can be toggled independently. Defaults to all enabled.
 * Changes are reflected site-wide on the next page load.
 */

const STORAGE_KEY = "alaya_social_proof_config";

export interface SocialProofConfig {
  /** Show "X people viewing this" */
  viewersEnabled: boolean;
  /** Show "X bought this in the last 24 hours" */
  purchasesEnabled: boolean;
  /** Show "X saved this to wishlist" */
  savesEnabled: boolean;
}

export const DEFAULT_CONFIG: SocialProofConfig = {
  viewersEnabled: true,
  purchasesEnabled: true,
  savesEnabled: true,
};

function getStored(): SocialProofConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

/**
 * Get the current social proof config.
 * Returns defaults if nothing is stored or on server side.
 */
export function getSocialProofConfig(): SocialProofConfig {
  return getStored();
}

/**
 * Update individual signal toggles in the config.
 * Only the provided fields are updated; others keep their current value.
 */
export function updateSocialProofConfig(updates: Partial<SocialProofConfig>): SocialProofConfig {
  const current = getStored();
  const updated = { ...current, ...updates };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("social-proof-config-updated", { detail: updated }));
  } catch {
    // Silently fail
  }
  return updated;
}

/**
 * Reset the config to defaults (all signals enabled).
 */
export function resetSocialProofConfig(): SocialProofConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("social-proof-config-updated", { detail: DEFAULT_CONFIG }));
  } catch {
    // Silently fail
  }
  return DEFAULT_CONFIG;
}
