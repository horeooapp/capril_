#!/bin/sh
# ──────────────────────────────────────────────────────────────────
# QAPRIL — docker-entrypoint.sh
# Attend que la DB soit prête, applique les migrations, démarre l'app
# ──────────────────────────────────────────────────────────────────
set -e

echo "[QAPRIL] Waiting for PostgreSQL to be ready..."
until pg_isready -h "${PGHOST:-postgres}" -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-qapril}" 2>/dev/null; do
  echo "[QAPRIL] PostgreSQL not ready, retrying in 2s..."
  sleep 2
done

echo "[QAPRIL] Running Prisma migrations..."
npx prisma migrate deploy

echo "[QAPRIL] Starting Next.js..."
exec node server.js
