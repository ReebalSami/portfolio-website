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

# Copy standalone server, resolving all pnpm symlinks into real files.
# pnpm's node_modules uses symlinks that don't work on Lambda.
# Strategy: copy everything, then resolve every symlink to a real file/dir.

# 1) Copy the full standalone output (preserving symlinks initially)
rsync -a "$NEXT_DIR/standalone/" "$DEPLOY_DIR/server/"

# 2) Resolve all symlinks to real files (in-place)
echo "  Resolving symlinks..."
find "$DEPLOY_DIR/server/node_modules" -type l | while read link; do
  # Resolve the link to its real target in the SOURCE tree
  # (symlinks point relative to .next/standalone, not .deploy)
  target=$(readlink "$link")
  link_dir=$(dirname "$link")

  # Convert deploy path back to standalone path to resolve
  rel_path="${link#$DEPLOY_DIR/server/}"
  source_link="$NEXT_DIR/standalone/$rel_path"
  real=$(readlink -f "$source_link" 2>/dev/null || echo "")

  if [ -n "$real" ] && [ -e "$real" ]; then
    rm -rf "$link"
    cp -r "$real" "$link"
  else
    # Broken symlink — remove it
    rm -f "$link"
  fi
done

# Verify critical modules exist
if [ ! -d "$DEPLOY_DIR/server/node_modules/next" ]; then
  echo "❌ Error: node_modules/next missing from server package"
  exit 1
fi
echo "  ✓ All symlinks resolved"

# 3) Promote pnpm internal hoisted packages to top-level node_modules
#    pnpm puts transitive deps in .pnpm/node_modules/ which Node.js can't find
if [ -d "$DEPLOY_DIR/server/node_modules/.pnpm/node_modules" ]; then
  echo "  Promoting hoisted packages..."
  for pkg in "$DEPLOY_DIR/server/node_modules/.pnpm/node_modules"/*; do
    name=$(basename "$pkg")
    target="$DEPLOY_DIR/server/node_modules/$name"
    if [ ! -e "$target" ]; then
      cp -r "$pkg" "$target"
    fi
  done
fi

# 3b) Fix incomplete packages in standalone output.
#     Next.js standalone traces only used files, but some packages (e.g. @swc/helpers)
#     need their full structure. Copy from project node_modules if incomplete.
MAIN_SWC="$ROOT_DIR/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers"
DEPLOY_SWC="$DEPLOY_DIR/server/node_modules/@swc/helpers"
if [ -d "$MAIN_SWC" ] && [ -d "$DEPLOY_SWC" ]; then
  echo "  Fixing @swc/helpers (copying full package)..."
  rm -rf "$DEPLOY_SWC"
  cp -r "$MAIN_SWC" "$DEPLOY_SWC"
fi

# 4) Remove unnecessary files to reduce Lambda package size
echo "  Trimming package..."
rm -rf "$DEPLOY_DIR/server/infra" \
       "$DEPLOY_DIR/server/docs" \
       "$DEPLOY_DIR/server/design-system" \
       "$DEPLOY_DIR/server/utility" \
       "$DEPLOY_DIR/server/tests" \
       "$DEPLOY_DIR/server/scripts" \
       "$DEPLOY_DIR/server/.windsurf" \
       "$DEPLOY_DIR/server/.github" \
       "$DEPLOY_DIR/server/Bewerbung"
find "$DEPLOY_DIR/server" -name "*.map" -delete 2>/dev/null
find "$DEPLOY_DIR/server" -name "*.d.ts" -not -path "*/next/*" -delete 2>/dev/null
find "$DEPLOY_DIR/server/node_modules" -name "README.md" -o -name "CHANGELOG.md" -o -name "LICENSE" | xargs rm -f 2>/dev/null

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
