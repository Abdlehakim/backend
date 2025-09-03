# backend/Dockerfile
FROM ghcr.io/puppeteer/puppeteer:24.17.1

USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-noto-core fonts-noto-extra fonts-dejavu-core fonts-noto-color-emoji \
  && rm -rf /var/lib/apt/lists/*

# Work in a directory owned by pptruser
WORKDIR /home/pptruser/app

# copy manifests with correct ownership (faster & safe)
COPY --chown=pptruser:pptruser package*.json tsconfig.json ./

USER pptruser
RUN npm ci

COPY --chown=pptruser:pptruser src ./src
RUN npm run build

# trim dev deps without touching the lockfile
RUN npm prune --omit=dev --no-audit --no-fund --no-optional --no-save

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","-r","module-alias/register","dist/app.js"]
