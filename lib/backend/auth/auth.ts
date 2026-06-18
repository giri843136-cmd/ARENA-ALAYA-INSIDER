/**
 * ALAYA INSIDER — Authentication Layer (Enterprise Security)
 * Single-user primary admin, 2FA, delegated access, password hashing.
 * Enterprise-grade security modeled after Stripe, Linear, 1Password.
 */

import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import NextAuth from "next-auth";
import { getServerSession } from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { sendMagicLink } from "@/lib/backend/email/resend";
import { verifyPassword } from "@/lib/backend/auth/password";
import { is2FAEnabled, verifyTOTP, verifyBackupCode } from "@/lib/backend/auth/two-factor";
import { hasDelegatedAccess } from "@/lib/backend/auth/delegated-access";
import { recordLoginAttempt, isRateLimited, logSecurityEvent } from "@/lib/backend/security/audit";

const PRIMARY_ADMIN_EMAIL = "alayainsider@gmail.com";

// Only allow the primary admin email for credential login
// Delegated users must use Google OAuth or magic link
const ALLOWED_EMAILS = [PRIMARY_ADMIN_EMAIL];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours (reduced from 30 days for security)
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || "smtp.resend.com",
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER || "resend",
          pass: process.env.RESEND_API_KEY || "",
        },
      },
      from: process.env.EMAIL_FROM || "ALAYA INSIDER <hello@alayainsider.com>",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await sendMagicLink(email, url);
      },
    }),
    CredentialsProvider({
      name: "Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpToken: { label: "2FA Code", type: "text" },
        backupCode: { label: "Backup Code", type: "text" },
      },
      async authorize(credentials, req) {
        const ipAddress = (req?.headers?.["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req?.headers?.["x-real-ip"] as string || "unknown";
        
        if (!credentials?.email || !credentials?.password) return null;
        
        const email = credentials.email.toLowerCase().trim();
        
        // Strict: only primary admin can use credential login
        if (!ALLOWED_EMAILS.includes(email)) {
          // Check if delegated user - they should use Google OAuth
          const delegatedUser = await prisma.user.findUnique({ where: { email } });
          if (delegatedUser) {
            const hasAccess = await hasDelegatedAccess(delegatedUser.id);
            if (hasAccess) {
              // Delegated users must sign in with Google OAuth, not credentials
              await logSecurityEvent({
                userId: delegatedUser.id,
                action: "login_blocked_credentials",
                details: "Delegated user attempted credential login - must use Google OAuth",
                ipAddress,
                severity: "warning",
              });
              return null;
            }
          }
          return null;
        }

        // Rate limiting check
        const limited = await isRateLimited(email, ipAddress);
        if (limited) {
          await logSecurityEvent({
            action: "login_rate_limited",
            details: `Rate limited login attempt for ${email} from ${ipAddress}`,
            ipAddress,
            severity: "warning",
          });
          throw new Error("Too many login attempts. Please try again in 15 minutes.");
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          await recordLoginAttempt({ email, ipAddress, success: false, failReason: "user_not_found" });
          return null;
        }

        if (user.blocked) {
          await recordLoginAttempt({ email, ipAddress, success: false, failReason: "account_blocked" });
          await logSecurityEvent({
            userId: user.id,
            action: "login_blocked_account",
            details: "Blocked account attempted login",
            ipAddress,
            severity: "critical",
          });
          return null;
        }

        // Verify password using the passwordHash field (added via migration)
        const passwordHash = (user as any).passwordHash;
        if (!passwordHash) {
          // First-time login - must change password
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            mustChangePassword: true,
          } as any;
        }

        const validPassword = await verifyPassword(credentials.password, passwordHash);
        if (!validPassword) {
          await recordLoginAttempt({ email, ipAddress, success: false, failReason: "invalid_password" });
          await logSecurityEvent({
            userId: user.id,
            action: "login_failed_password",
            details: "Invalid password attempt",
            ipAddress,
            severity: "warning",
          });
          return null;
        }

        // Check 2FA
        const twoFAEnabled = await is2FAEnabled(user.id);
        if (twoFAEnabled) {
          const totpToken = credentials.totpToken;
          const backupCode = credentials.backupCode;
          
          if (!totpToken && !backupCode) {
            // 2FA required but not provided - return special response
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              requires2FA: true,
            } as any;
          }

          let twoFAValid = false;
          if (totpToken) {
            twoFAValid = await verifyTOTP(user.id, totpToken);
          } else if (backupCode) {
            twoFAValid = await verifyBackupCode(user.id, backupCode);
            await logSecurityEvent({
              userId: user.id,
              action: backupCode ? "login_backup_code_used" : "login_2fa_failed",
              details: backupCode ? "Backup code used for login" : "2FA verification failed",
              ipAddress,
              severity: backupCode ? "warning" : "critical",
            });
          }

          if (!twoFAValid) {
            await recordLoginAttempt({ email, ipAddress, success: false, failReason: "2fa_failed" });
            return null;
          }
        }

        // Successful login
        await recordLoginAttempt({ email, ipAddress, success: true });
        await logSecurityEvent({
          userId: user.id,
          action: "login_success",
          details: `Successful login from ${ipAddress}`,
          ipAddress,
          severity: "info",
        });

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        (token as any).role = (user as any).role || "USER";
        (token as any).id = (user as any).id;
        (token as any).mustChangePassword = (user as any).mustChangePassword || false;
        (token as any).requires2FA = (user as any).requires2FA || false;
        
        // For delegated users signing in via Google OAuth, set role
        if (account?.provider === "google") {
          const delegatedEmail = user.email || "";
          const delegated = await prisma.delegatedAccess.findFirst({
            where: { email: delegatedEmail, active: true },
          });
          if (delegated) {
            (token as any).role = delegated.role;
          }
        }
      }
      
      // Check if session needs 2FA
      if ((token as any).requires2FA) {
        // This is a temporary token for 2FA verification
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = (token as any).id as string;
        (session.user as any).role = (token as any).role as string;
        (session.user as any).mustChangePassword = (token as any).mustChangePassword || false;
      }
      return session;
    },
    async signIn({ user, account }) {
      // For Google OAuth sign-in, verify delegated access
      if (account?.provider === "google") {
        // Primary admin always allowed
        if (user.email?.toLowerCase() === ALLOWED_EMAILS[0]) {
          return true;
        }
        
        // Check if this user has delegated access
        const hasAccess = await hasDelegatedAccess(user.id);
        if (!hasAccess) {
          await logSecurityEvent({
            userId: user.id,
            action: "login_blocked_unauthorized",
            details: `Unauthorized Google OAuth login attempt for ${user.email}`,
            severity: "critical",
          });
          return false;
        }
        return true;
      }
      
      return true;
    },
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  events: {
    async signIn({ user }) {
      try {
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action: "user_signed_in",
            entityType: "user",
            entityId: user.id,
          },
        });
      } catch {
        // Non-critical
      }
    },
  },
};

// Export the NextAuth handler directly (v4 App Router pattern) plus auth utilities
export const authHandler = NextAuth(authOptions as any) as any;
export const { auth, signIn, signOut } = authHandler;
export const handlers = {
  GET: authHandler,
  POST: authHandler,
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions as any);
  return (session as any)?.user || null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
