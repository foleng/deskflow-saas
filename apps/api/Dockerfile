FROM node:18-alpine AS builder

WORKDIR /app

# 1. 安装 pnpm
RUN npm install -g pnpm

# 2. 复制整个项目 (不再挑挑拣拣，全部拿进来)
COPY . .

# 3. 安装所有依赖
# --shamefully-hoist 可以把依赖铺平，避免找不到包的问题
RUN pnpm install --shamefully-hoist

# 4. 构建后端 API (假设你的 package.json 里叫 api 或 kefu-system)
# 如果你不确定名字，直接构建全部也行：RUN pnpm turbo run build
RUN pnpm turbo run build --filter=api

# 5. 暴露端口
EXPOSE 3000

# 6. 启动
# 因为没有移动文件，dist 肯定在 apps/api/dist 下
CMD ["node", "apps/api/dist/main.js"]