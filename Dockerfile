# backend/Dockerfile
# Chrome + Puppeteer preinstalled
FROM ghcr.io/puppeteer/puppeteer:24.17.1

# Fonts for Arabic/French/Emoji in PDFs
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-noto-core \
    fonts-noto-extra \
    fonts-dejavu-core \
    fonts-noto-color-emoji \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy manifest files with correct ownership for the non-root user
COPY --chown=pptruser:pptruser package*.json tsconfig.json ./

# Install deps as non-root
USER pptruser
RUN npm ci

# Copy source with correct ownership, then build
COPY --chown=pptruser:pptruser src ./src
RUN npm run build

# Trim dev deps without touching the lockfile
RUN npm prune --omit=dev --no-audit --no-fund --no-optional --no-save

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "-r", "module-alias/register", "dist/app.js"]
