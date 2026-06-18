-- =============================================
-- ALAYA INSIDER — Migration 003
-- Add CompetitorAlert and InventoryAlert models
-- =============================================

-- Competitor Alert: Stores competitive intelligence alerts from competitor tracking
CREATE TABLE "CompetitorAlert" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- "new_product" | "price_change" | "content_update" | "trend_shift"
    "competitorName" TEXT NOT NULL,
    "competitorUrl" TEXT NOT NULL,
    "productName" TEXT,
    "productUrl" TEXT,
    "oldPrice" DECIMAL(10,2),
    "newPrice" DECIMAL(10,2),
    "changePercent" DECIMAL(5,2),
    "category" TEXT,
    "severity" TEXT NOT NULL, -- "low" | "medium" | "high"
    "suggestedAction" TEXT,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorAlert_pkey" PRIMARY KEY ("id")
);

-- Performance indexes for CompetitorAlert
CREATE INDEX "CompetitorAlert_type_createdAt_idx" ON "CompetitorAlert"("type", "createdAt");
CREATE INDEX "CompetitorAlert_competitorName_idx" ON "CompetitorAlert"("competitorName");
CREATE INDEX "CompetitorAlert_severity_idx" ON "CompetitorAlert"("severity");
CREATE INDEX "CompetitorAlert_dismissed_createdAt_idx" ON "CompetitorAlert"("dismissed", "createdAt");

-- Inventory Alert: Stores stockout predictions and inventory warnings
CREATE TABLE "InventoryAlert" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "dailySalesRate" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "daysUntilOutOfStock" INTEGER,
    "predictedDate" TIMESTAMP(3),
    "reorderPoint" INTEGER NOT NULL DEFAULT 0,
    "confidence" TEXT NOT NULL, -- "high" | "medium" | "low"
    "salesVelocity" TEXT NOT NULL, -- "increasing" | "stable" | "declining"
    "seasonality" TEXT,
    "recommendations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryAlert_pkey" PRIMARY KEY ("id")
);

-- Performance indexes for InventoryAlert
CREATE INDEX "InventoryAlert_productId_idx" ON "InventoryAlert"("productId");
CREATE INDEX "InventoryAlert_daysUntilOutOfStock_idx" ON "InventoryAlert"("daysUntilOutOfStock");
CREATE INDEX "InventoryAlert_createdAt_idx" ON "InventoryAlert"("createdAt");
CREATE INDEX "InventoryAlert_dismissed_idx" ON "InventoryAlert"("dismissed");

-- =============================================
-- Update Prisma migrations table
-- =============================================
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
VALUES (
    '003_add_competitor_inventory_alerts',
    'manual',
    NOW(),
    '003_add_competitor_inventory_alerts',
    NULL,
    NULL,
    NOW(),
    1
);
