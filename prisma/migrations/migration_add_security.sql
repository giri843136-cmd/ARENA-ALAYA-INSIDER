-- ALAYA INSIDER — Security Models Migration
-- Run this against the production PostgreSQL database
-- Idempotent: safe to run multiple times
-- Usage: psql $DATABASE_URL -f prisma/migrations/migration_add_security.sql

-- TwoFactorAuth table
CREATE TABLE IF NOT EXISTS "TwoFactorAuth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TwoFactorAuth_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TwoFactorAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "TwoFactorAuth_userId_key" UNIQUE ("userId")
);

CREATE INDEX IF NOT EXISTS "TwoFactorAuth_userId_idx" ON "TwoFactorAuth"("userId");

-- BackupCode table
CREATE TABLE IF NOT EXISTS "BackupCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackupCode_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BackupCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "BackupCode_userId_idx" ON "BackupCode"("userId");
CREATE INDEX IF NOT EXISTS "BackupCode_codeHash_idx" ON "BackupCode"("codeHash");

-- LoginAttempt table
CREATE TABLE IF NOT EXISTS "LoginAttempt" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL,
    "failReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LoginAttempt_email_createdAt_idx" ON "LoginAttempt"("email", "createdAt");
CREATE INDEX IF NOT EXISTS "LoginAttempt_ipAddress_createdAt_idx" ON "LoginAttempt"("ipAddress", "createdAt");
CREATE INDEX IF NOT EXISTS "LoginAttempt_createdAt_idx" ON "LoginAttempt"("createdAt");

-- DelegatedAccess table
CREATE TABLE IF NOT EXISTS "DelegatedAccess" (
    "id" TEXT NOT NULL,
    "grantedBy" TEXT NOT NULL,
    "grantedTo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EDITOR',
    "permissions" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DelegatedAccess_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "DelegatedAccess_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "DelegatedAccess_grantedBy_idx" ON "DelegatedAccess"("grantedBy");
CREATE INDEX IF NOT EXISTS "DelegatedAccess_email_idx" ON "DelegatedAccess"("email");
CREATE INDEX IF NOT EXISTS "DelegatedAccess_active_idx" ON "DelegatedAccess"("active");

-- SecurityAuditLog table
CREATE TABLE IF NOT EXISTS "SecurityAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityAuditLog_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SecurityAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "SecurityAuditLog_userId_createdAt_idx" ON "SecurityAuditLog"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "SecurityAuditLog_action_idx" ON "SecurityAuditLog"("action");
CREATE INDEX IF NOT EXISTS "SecurityAuditLog_createdAt_idx" ON "SecurityAuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "SecurityAuditLog_severity_idx" ON "SecurityAuditLog"("severity");

-- Add passwordHash column to User if not exists
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
