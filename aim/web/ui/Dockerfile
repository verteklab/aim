# 使用 Node.js 镜像来构建项目
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml 用于安装依赖
COPY package.json package-lock.json pnpm-lock.yaml ./

COPY public ./public

# 安装 pnpm 并安装依赖
RUN npm install -g pnpm --registry=https://registry.npmmirror.com

RUN npm config set registry https://registry.npmmirror.com

RUN npm install --legacy-peer-deps

# 复制源码
COPY . .

# 构建项目
RUN pnpm build

# 第二阶段 - 使用 nginx 作为静态文件服务器
FROM nginx:alpine

# 删除默认的 nginx 静态文件配置
RUN rm -rf /usr/share/nginx/html/*

# 复制构建的 dist 文件到 nginx 静态文件目录
COPY --from=builder /app/build /usr/share/nginx/html

# 复制自定义 nginx 配置文件（可选）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口 80
EXPOSE 80

# 启动 nginx 服务
CMD ["nginx", "-g", "daemon off;"]