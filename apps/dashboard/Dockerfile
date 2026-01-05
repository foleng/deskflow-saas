FROM node:18-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN npm install -g pnpm

# Copy workspace config
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Copy package manifests
COPY apps/api/package.json ./apps/api/package.json
COPY apps/dashboard/package.json ./apps/dashboard/package.json
COPY apps/widget/package.json ./apps/widget/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/ui/package.json ./packages/ui/package.json

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source
COPY . .

# Build Dashboard
ENV VITE_API_URL=/api
RUN pnpm turbo run build --filter=dashboard...

# 确保 widget 也被打包出来 (使用绝对路径)
ENV VITE_API_URL=http://59.110.7.69
RUN pnpm turbo run build --filter=widget

# Serve Stage
FROM nginx:alpine

# Copy build artifacts
COPY --from=builder /app/apps/dashboard/dist /usr/share/nginx/html

# 这样访问 http://IP/widget.js 就能拿到插件
COPY --from=builder /app/apps/widget/dist/widget.js /usr/share/nginx/html/widget.js

# Copy Nginx config
COPY apps/dashboard/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
