# 部署到阿里云 ECS 指南

## 1. 准备工作

### 1.1 购买 ECS 实例
- **操作系统**: 推荐 Ubuntu 22.04 LTS 或 20.04 LTS。
- **配置**: 建议至少 2核 4G 内存（因为需要运行 MySQL, Redis, Mongo, API, Dashboard 等多个容器）。
- **安全组 (防火墙)**: 确保开放以下端口：
  - `80` (HTTP - 访问前端)
  - `22` (SSH - 远程连接)
  - (可选) `3000` (如果需要直接调试 API)

### 1.2 连接服务器
使用 SSH 连接到你的服务器：
```bash
ssh root@<你的公网IP>
```

### 1.3 安装 Docker 和 Docker Compose
在服务器上执行以下命令安装 Docker：

```bash
# 更新 apt
sudo apt-get update

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 验证安装
docker --version
docker compose version
```

## 2. 部署代码

### 2.1 上传代码
你可以通过 Git 克隆或者 SCP 上传代码。

**方式 A: Git (推荐)**
1. 在阿里云上生成 SSH Key 并添加到你的 Git 仓库 (GitHub/GitLab)。
2. 克隆代码：
   ```bash
   git clone <你的仓库地址> deskflow
   cd deskflow
   ```

**方式 B: 本地上传**
在本地项目根目录执行 (需安装 SCP 客户端，如 Git Bash 或 Putty):
```bash
# 排除 node_modules 和 .git 减少传输时间
scp -r -P 22 ./* root@<你的公网IP>:/root/deskflow/
```

### 2.2 配置环境变量
在服务器项目根目录下创建 `.env` 文件：

```bash
cd deskflow
nano .env
```

粘贴以下内容 (请修改密码和密钥):

```env
# Database Passwords
MYSQL_ROOT_PASSWORD=your_secure_mysql_password
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=your_secure_minio_password

# JWT Secret (用于生成 Token)
JWT_SECRET=your_complex_random_secret_string

# API Configuration
PORT=3000
```

保存并退出 (`Ctrl+O`, `Enter`, `Ctrl+X`)。

### 2.3 启动服务
使用专门的生产环境 Compose 文件启动：

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

- `-d`: 后台运行
- `--build`: 强制重新构建镜像

### 2.4 验证部署
1. 查看容器状态：
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```
   应该看到 api, dashboard, mysql, redis, mongo 等服务状态为 `Up`。

2. 访问前端：
   在浏览器输入 `http://<你的公网IP>`。
   应该能看到登录页面。

3. 测试 API：
   尝试登录或注册，检查是否正常。

## 3. 后续维护

### 更新代码
```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build api dashboard
# 只重新构建应用，不重启数据库
```

### 查看日志
```bash
docker compose -f docker-compose.prod.yml logs -f api
# 或
docker compose -f docker-compose.prod.yml logs -f dashboard
```

### 数据备份
数据库文件存储在 Docker Volume 中 (`mysql_data`, `mongo_data` 等)。建议定期备份这些数据。

## 4. (进阶) 使用阿里云 OSS 代替本地存储
如果希望文件存储更可靠，可以在阿里云开通 OSS 服务，并修改 `.env` 和代码配置使用 OSS，而不是本地文件系统。
