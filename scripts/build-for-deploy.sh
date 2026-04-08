#!/usr/bin/env bash
# =============================================================================
# Build Next.js for AWS Lambda deployment
# =============================================================================
# Creates .deploy/ directory with:
#   .deploy/server/  — Next.js standalone server (Lambda code)
#   .deploy/static/  — Static assets (_next/static + public/) → S3
#
# Usage: ./scripts/build-for-deploy.sh
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_DIR="$ROOT_DIR/.deploy"
NEXT_DIR="$ROOT_DIR/.next"

echo "🔨 Building Next.js for AWS Lambda deployment..."

# ─── Clean previous build ──────────────────────────────────────────────
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR/server" "$DEPLOY_DIR/static"

# ─── Build Next.js (standalone mode) ───────────────────────────────────
echo "📦 Running next build..."
cd "$ROOT_DIR"
pnpm build

if [ ! -d "$NEXT_DIR/standalone" ]; then
  echo "❌ Error: .next/standalone/ not found. Ensure output: 'standalone' is in next.config.ts"
  exit 1
fi

# ─── Package server for Lambda ─────────────────────────────────────────
echo "📁 Packaging server..."

# Copy standalone server (rsync skips broken pnpm symlinks with --safe-links)
rsync -a --copy-links --safe-links "$NEXT_DIR/standalone/" "$DEPLOY_DIR/server/" || true

# Copy static assets into server (needed for image optimization etc.)
if [ -d "$NEXT_DIR/static" ]; then
  mkdir -p "$DEPLOY_DIR/server/.next/static"
  cp -r "$NEXT_DIR/static/." "$DEPLOY_DIR/server/.next/static/"
fi

# Copy public assets into server
if [ -d "$ROOT_DIR/public" ]; then
  mkdir -p "$DEPLOY_DIR/server/public"
  cp -r "$ROOT_DIR/public/." "$DEPLOY_DIR/server/public/"
fi

# Create Lambda bootstrap script (used by Lambda Web Adapter)
cat > "$DEPLOY_DIR/server/run.sh" << 'EOF'
#!/bin/bash
export NODE_ENV=production
exec node server.js
EOF
chmod +x "$DEPLOY_DIR/server/run.sh"

# ─── Package static assets for S3 ──────────────────────────────────────
echo "📁 Packaging static assets..."

# Copy _next/static
if [ -d "$NEXT_DIR/static" ]; then
  mkdir -p "$DEPLOY_DIR/static/_next/static"
  cp -r "$NEXT_DIR/static/." "$DEPLOY_DIR/static/_next/static/"
fi

# Copy public assets
if [ -d "$ROOT_DIR/public" ]; then
  cp -r "$ROOT_DIR/public/." "$DEPLOY_DIR/static/"
fi

# ─── Summary ────────────────────────────────────────────────────────────
SERVER_SIZE=$(du -sh "$DEPLOY_DIR/server" | cut -f1)
STATIC_SIZE=$(du -sh "$DEPLOY_DIR/static" | cut -f1)
echo ""
echo "✅ Build complete!"
echo "   Server (Lambda):  $DEPLOY_DIR/server/ ($SERVER_SIZE)"
echo "   Static (S3):      $DEPLOY_DIR/static/ ($STATIC_SIZE)"
echo ""
echo "Next steps:"
echo "   cd infra && npx cdk deploy --all --context stage=preview"
