import { defineConfig } from "@prisma/config";

// In development, Next.js loads .env automatically.
// If DATABASE_URL is not set, fail loudly rather than silently using dummy credentials.
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env and set your database URL.');
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: dbUrl,
  },
});
