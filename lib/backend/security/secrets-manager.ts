/**
 * ALAYA INSIDER — Secrets Manager
 * Adapter pattern: reads from HashiCorp Vault (via HTTP API) with env var fallback
 * Supports rotation detection and audit logging
 */

// In-memory cache of fetched secrets
const secretCache = new Map<string, { value: string; expiresAt: number }>();

// Cache TTL (default 5 minutes)
const CACHE_TTL_MS = 5 * 60 * 1000;

// Vault configuration (from environment)
const VAULT_CONFIG = {
  enabled: process.env.VAULT_ENABLED === "true",
  addr: process.env.VAULT_ADDR || "",
  token: process.env.VAULT_TOKEN || "",
  engine: process.env.VAULT_ENGINE || "secret",
  path: process.env.VAULT_PATH || "alaya",
};

// Track which secrets have been accessed (for rotation audit)
const secretAccessLog = new Map<string, Date>();

/**
 * Retrieve a secret by key
 * Priority: Vault (if enabled) → environment variable → fallback
 */
export async function getSecret(key: string, fallback?: string): Promise<string | null> {
  // Check cache first
  const cached = secretCache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    secretAccessLog.set(key, new Date());
    return cached.value;
  }

  // Try Vault
  if (VAULT_CONFIG.enabled && VAULT_CONFIG.token) {
    try {
      const value = await fetchFromVault(key);
      if (value !== null) {
        secretCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
        secretAccessLog.set(key, new Date());
        return value;
      }
    } catch {
      // Vault unavailable — fall through to env var
      console.warn(`[SecretsManager] Vault unavailable for key: ${key}`);
    }
  }

  // Fallback to environment variable
  const envValue = process.env[key];
  if (envValue) {
    return envValue;
  }

  // Use provided fallback
  if (fallback !== undefined) {
    return fallback;
  }

  return null;
}

/**
 * Fetch a secret from HashiCorp Vault KV v2 engine
 */
async function fetchFromVault(key: string): Promise<string | null> {
  if (!VAULT_CONFIG.addr || !VAULT_CONFIG.token) return null;

  const url = `${VAULT_CONFIG.addr}/v1/${VAULT_CONFIG.engine}/data/${VAULT_CONFIG.path}`;

  const response = await fetch(url, {
    headers: {
      "X-Vault-Token": VAULT_CONFIG.token,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Vault error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data?.data?.data?.[key] || null;
}

/**
 * Get all secrets access times (for rotation audit)
 */
export function getSecretAccessAudit(): Record<string, Date> {
  const result: Record<string, Date> = {};
  for (const [key, date] of secretAccessLog) {
    result[key] = date;
  }
  return result;
}

/**
 * Clear the secret cache (force re-fetch on next access)
 */
export function clearSecretCache(): void {
  secretCache.clear();
}

/**
 * Check if a secret needs rotation (based on age)
 */
export function needsRotation(
  key: string,
  maxAgeDays = 90
): boolean {
  const lastAccess = secretAccessLog.get(key);
  if (!lastAccess) return false;

  const ageMs = Date.now() - lastAccess.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return ageDays >= maxAgeDays;
}

/**
 * Quick accessors for common secrets
 */

export function getDatabaseUrl(): Promise<string | null> {
  return getSecret("DATABASE_URL");
}

export function getNextAuthSecret(): Promise<string | null> {
  return getSecret("NEXTAUTH_SECRET");
}

export function getResendApiKey(): Promise<string | null> {
  return getSecret("RESEND_API_KEY");
}

export function getGoogleClientId(): Promise<string | null> {
  return getSecret("GOOGLE_CLIENT_ID");
}

export function getGoogleClientSecret(): Promise<string | null> {
  return getSecret("GOOGLE_CLIENT_SECRET");
}

export function getAnthropicApiKey(): Promise<string | null> {
  return getSecret("ANTHROPIC_API_KEY");
}

export function getUpstashRedisUrl(): Promise<string | null> {
  return getSecret("UPSTASH_REDIS_REST_URL");
}

export function getUpstashRedisToken(): Promise<string | null> {
  return getSecret("UPSTASH_REDIS_REST_TOKEN");
}
