/**
 * ALAYA INSIDER — Internal TypeScript SDK (Phase 13)
 * Type-safe client for platform APIs (search, recommendations, AI, analytics, status).
 * For internal services, admin tools, and future mobile/partner SDKs.
 */

export interface AlayaClientOptions {
  baseUrl?: string;
  apiKey?: string;
}

export class AlayaClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(opts: AlayaClientOptions = {}) {
    this.baseUrl = opts.baseUrl || 'https://api.alayainsider.com';
    this.apiKey = opts.apiKey;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
    };

    const res = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }

  async getGlobalStatus() {
    return this.request('/ops/global-status');
  }

  async search(query: string, options?: { limit?: number; filters?: string }) {
    const params = new URLSearchParams({ q: query, ...options });
    return this.request(`/search?${params}`);
  }

  async getRecommendations(productId: string, userId?: string) {
    const params = new URLSearchParams({ productId });
    if (userId) params.set('userId', userId);
    return this.request(`/recommendations/products?${params}`);
  }

  // Add more typed methods for AI tasks, analytics, etc. as needed
}

export const alaya = new AlayaClient();
