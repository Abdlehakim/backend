# backend/Dockerfile
FROM ghcr.io/puppeteer/puppeteer:24.17.1

USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-noto-core fonts-noto-extra fonts-dejavu-core fonts-noto-color-emoji \
  && rm -rf /var/lib/apt/lists/*

# create the app dir and give it to pptruser (so npm can write node_modules)
RUN install -d -o pptruser -g pptruser /home/pptruser/app
WORKDIR /home/pptruser/app

# copy manifests with the right owner
COPY --chown=pptruser:pptruser package*.json tsconfig.json ./

USER pptruser
RUN npm ci

COPY --chown=pptruser:pptruser src ./src
RUN npm run build
# prune without touching lockfile
RUN npm prune --omit=dev --no-audit --no-fund --no-optional --no-save

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","-r","module-alias/register","dist/app.js"]
