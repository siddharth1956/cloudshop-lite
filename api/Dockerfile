# api/Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies layer (cached separately)
COPY package*.json ./
RUN npm install --omit=dev

# Source
COPY . .

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]
