#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Synculariti Core — Unified Deploy Script
# =============================================================================
# Usage:
#   ./scripts/deploy.sh              # Deploy both Render + Vercel
#   ./scripts/deploy.sh --render     # Deploy only Render
#   ./scripts/deploy.sh --vercel     # Deploy only Vercel
# =============================================================================

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RENDER_SERVICE="synculariti-api"

echo "=== Synculariti Deploy ==="

deploy_render() {
  echo ""
  echo "--- Render: Building & Deploying ---"
  cd "$ROOT_DIR"
  render deploy "$RENDER_SERVICE"
  echo "✅ Render deploy triggered"
}

deploy_vercel() {
  echo ""
  echo "--- Vercel: Deploying SPA ---"
  cd "$ROOT_DIR/apps/web"
  vercel --prod --yes
  echo "✅ Vercel deploy triggered"
}

case "${1:-all}" in
  --render)  deploy_render ;;
  --vercel)  deploy_vercel ;;
  all|*)     deploy_render && deploy_vercel ;;
esac

echo ""
echo "=== Done ==="
