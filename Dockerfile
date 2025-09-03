# backend/Dockerfile
FROM ghcr.io/puppeteer/puppeteer:24.17.1

# Fonts for Arabic/French/Emoji in PDFs
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-noto-core fonts-noto-extra fonts-dejavu-core fonts-noto-color-emoji \
  && rm -rf /var/lib/apt/lists/*

# Create a writable app dir for the non-root user
RUN install -d -o pptruser -g pptruser /home/pptruser/app
WORKDIR /home/pptruser/app

# Copy manifests with correct ownership (so npm can write lock/node_modules)
COPY --chown=pptruser:pptruser package*.json tsconfig.json ./

# Switch to non-root user before installing
USER pptruser
RUN npm ci

# Copy source with correct ownership and build
COPY --chown=pptruser:pptruser src ./src
RUN npm run build

# Trim dev deps without touching the lockfile (prevents lockfile writes)
RUN npm prune --omit=dev --no-audit --no-fund --no-optional --no-save

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","-r","module-alias/register","dist/app.js"]
