/**
 * ALAYA INSIDER — PM2 Ecosystem
 * Production process management for Next.js + Workers
 */

module.exports = {
  apps: [
    {
      name: "alaya-insider",
      script: "npm",
      args: "start",                    // Works with both standalone and non-standalone output
      instances: 1,                    // Increase for multi-core
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
      },
      error_file: "./logs/alaya-error.log",
      out_file: "./logs/alaya-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      max_memory_restart: "1G",
      restart_delay: 4000,
    },
    {
      name: "alaya-workers",
      script: "./workers/index.ts",
      instances: 1,
      exec_mode: "fork",
      interpreter: "tsx",
      env: {
        NODE_ENV: "production",
      },
      error_file: "./logs/workers-error.log",
      out_file: "./logs/workers-out.log",
      max_memory_restart: "512M",
      restart_delay: 5000,
    },
  ],
};