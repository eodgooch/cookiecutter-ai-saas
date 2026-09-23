#!/bin/sh
set -e

echo "==> Running Drizzle migrations..."
npx drizzle-kit migrate

echo "==> All migrations complete."
