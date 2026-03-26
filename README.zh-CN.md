[English](README.md) | [简体中文](README.zh-CN.md)

# Deskflow SaaS

Deskflow SaaS 是一个全面的客户服务平台，使用现代 Web 技术构建，旨在通过实时聊天、座席管理和分析功能简化客户支持运营。

## 功能特性

- 实时聊天：基于 WebSocket 的通信，实现客户与座席的即时互动
- 座席管理：完整的座席生命周期管理，带有基于角色的访问控制
- 会话历史：所有客户互动的持久存储
- 知识库：客户支持信息的集中存储库
- 分析仪表盘：实时统计和报告
- 多语言支持：内置国际化支持，适合全球团队
- 文件上传：支持在会话期间上传和共享文件

## 技术栈

### 后端 (apps/api)
- 框架：NestJS
- 数据库：MySQL/MariaDB, MongoDB
- 缓存：Redis
- 实时通信：Socket.IO
- 认证：JWT, Google OAuth
- 文件存储：本地存储，支持 MinIO

### 前端仪表盘 (apps/dashboard)
- 框架：React 18
- UI 库：Ant Design
- 状态管理：Zustand
- 路由：React Router
- 国际化：i18next
- 构建工具：Vite

### 前端 Widget (apps/widget)
- 框架：React/Preact
- 构建工具：Vite
- 轻量级：优化加载速度

### 共享包
- 类型定义：共享 TypeScript 类型
- UI 组件：可重用 React 组件
- ESLint 配置：共享 linting 规则
- TypeScript 配置：共享 TypeScript 配置

## 快速开始

### 前置条件
- Node.js 18+
- pnpm 9+
- Docker 和 Docker Compose

### 安装步骤

1. 克隆仓库

```bash
git clone <repository-url>
cd deskflow-saas
```

2. 安装依赖

```bash
pnpm install
```

3. 启动开发环境

```bash
pnpm start
```

此命令将：
- 使用 Docker Compose 启动所有必需服务（MySQL, MongoDB, Redis, MinIO）
- 启动所有应用的开发服务器

4. 访问应用
- 仪表盘：http://localhost:5173
- API：http://localhost:3000
- Widget：http://localhost:5174

### 开发命令

| 命令 | 描述 |
|------|------|
| pnpm dev | 启动所有应用的开发模式 |
| pnpm build | 构建所有应用和包 |
| pnpm lint | 运行所有应用和包的 linting |
| pnpm format | 使用 Prettier 格式化所有文件 |
| pnpm check-types | 运行 TypeScript 类型检查 |

### 环境变量

请参考每个应用目录中的 .env.example 文件，获取所需的环境变量。

## 项目结构

```
deskflow-saas/
├── apps/
│   ├── api/              # 后端 API 应用
│   ├── dashboard/        # 座席前端仪表盘
│   └── widget/           # 客户聊天组件
├── packages/
│   ├── eslint-config/    # 共享 ESLint 配置
│   ├── types/            # 共享 TypeScript 类型
│   ├── typescript-config/ # 共享 TypeScript 配置
│   └── ui/               # 共享 UI 组件
├── docker-compose.yml    # Docker Compose 配置
├── package.json          # 根包配置
├── pnpm-workspace.yaml   # pnpm 工作区配置
└── turbo.json            # Turborepo 配置
```

## 部署

### 开发环境
使用 pnpm start 在开发模式下运行应用，包含所有服务。

### 生产环境
请参考 docker-compose.prod.yml 进行生产部署配置。

## 贡献

欢迎贡献！请按照以下步骤进行：

1. Fork 仓库
2. 创建功能分支 (git checkout -b feature/your-feature)
3. 提交更改 (git commit -m 'Add some feature')
4. 推送到分支 (git push origin feature/your-feature)
5. 打开 Pull Request

## 许可证

MIT