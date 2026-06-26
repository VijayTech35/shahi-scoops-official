# ── Build frontend ─────────────────────────────────────────
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# ── Production image ───────────────────────────────────────
FROM node:24-alpine
WORKDIR /app

# Copy built frontend
COPY --from=build /app/dist ./dist

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev --ignore-scripts
COPY server/ ./server/
RUN mkdir -p /app/server/data

ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --spider --quiet http://localhost:10000/health || exit 1

CMD ["node", "server/index.js"]
