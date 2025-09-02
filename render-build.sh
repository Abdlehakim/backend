#!/usr/bin/env bash
set -o errexit

# Persisted cache folder on Render
export PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p "$PUPPETEER_CACHE_DIR"

# Install deps and download Chrome for Testing into the cache
npm ci || npm install
npx puppeteer browsers install chrome

# (Optional: mirror to/from the project build cache path Render uses)
if [ -d /opt/render/project/src/.cache/puppeteer/chrome ]; then
  cp -R /opt/render/project/src/.cache/puppeteer/chrome/* "$PUPPETEER_CACHE_DIR/chrome/" 2>/dev/null || true
else
  mkdir -p /opt/render/project/src/.cache/puppeteer/chrome
  cp -R "$PUPPETEER_CACHE_DIR/chrome/"* /opt/render/project/src/.cache/puppeteer/chrome/ 2>/dev/null || true
fi
