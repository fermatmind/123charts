# Build on the target Linux architecture; never copy macOS node_modules.
FROM node:24-bookworm-slim@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5 AS build
WORKDIR /source
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG CHARTS_SOURCE_COMMIT
ARG CHARTS_SOURCE_DIRTY=false
ENV CHARTS_BUILD_DIR=.next-production
RUN npm run build
RUN CHARTS_SOURCE_COMMIT=$CHARTS_SOURCE_COMMIT CHARTS_SOURCE_DIRTY=$CHARTS_SOURCE_DIRTY node deploy/scripts/package-release.mjs
FROM node:24-bookworm-slim@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5 AS runtime
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3110
COPY --from=build --chown=node:node /source/dist/release/ ./
USER node
EXPOSE 3110
CMD ["node", "server.js"]
