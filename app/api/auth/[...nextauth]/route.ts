/**
 * ALAYA INSIDER — NextAuth Route Handler (Catch-all)
 * Serves all auth endpoints: /api/auth/signin, /api/auth/session, etc.
 * Connected via handlers exported from lib/backend/auth/auth.ts
 */
import { handlers } from "@/lib/backend/auth/auth";

export const { GET, POST } = handlers;
