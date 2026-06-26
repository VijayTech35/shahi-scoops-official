FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p data && chown -R node:node data
USER node
EXPOSE 5000
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --spider --quiet http://localhost:5000/health || exit 1
CMD ["node", "index.js"]
