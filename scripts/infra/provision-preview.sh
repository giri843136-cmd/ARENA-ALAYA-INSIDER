#!/bin/bash
# Helper to spin up a full preview environment locally or in CI
echo "Provisioning ephemeral preview environment..."
docker compose -f infra/docker/docker-compose.yml up -d --build
echo "Preview ready at http://localhost:3000"
