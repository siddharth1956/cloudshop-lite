# frontend/Dockerfile — Multi-stage build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --ignore-scripts 2>/dev/null || true
COPY . .
RUN mkdir -p build && cp -r src/. build/

# Production stage — Nginx only
FROM nginx:1.25-alpine AS production
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
