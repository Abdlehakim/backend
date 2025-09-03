# backend/Dockerfile
# Base image with Chrome for Testing + Puppeteer preinstalled
FROM ghcr.io/puppeteer/puppeteer:24.17.1

# Install fonts so Arabic/French/Emoji render correctly in PDFs
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-noto-core \
    fonts-noto-extra \
    fonts-dejavu-core \
    fonts-noto-color-emoji \
  && rm -rf /var/lib/apt/lists/*
USER pptruser

# Puppeteer image already ships Chrome; don't re-download it
ENV PUPPETEER_SKIP_DOWNLOAD=1

WORKDIR /app

# Install deps (cache-friendly)
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy source and build TypeScript → dist/
COPY src ./src
RUN npm run build \
  && npm prune --omit=dev

ENV NODE_ENV=production
# Expose for local runs (Render sets PORT env automatically)
EXPOSE 3000

# Start the server (module-alias points "@" → dist in package.json)
CMD ["node", "-r", "module-alias/register", "dist/app.js"]
