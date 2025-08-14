# Docker Compose Setup cho Web Nosime

## 🚀 Khởi chạy ứng dụng

### Bước 1: Build và khởi chạy tất cả services

```bash
docker-compose up --build
```

### Bước 2: Chạy trong background (tùy chọn)

```bash
docker-compose up -d --build
```

## 📋 Services

### 🗄️ Database (SQL Server 2019)

- **Container**: `web-nosime-db`
- **Port**: `14330:1433`
- **Image**: `mcr.microsoft.com/mssql/server:2019-latest`
- **Health check**: Kiểm tra kết nối SQL Server

### 🔄 Database Migration

- **Container**: `db-migrate`
- **Command**: `npm run migrate`
- **Phụ thuộc**: Chờ database health check
- **Mục đích**: Tạo database và import schema

### 🖥️ Server (Node.js API)

- **Container**: `web-nosime-server`
- **Port**: `5000:5000`
- **Build**: `./server/Dockerfile`
- **Phụ thuộc**: Chờ database migration hoàn thành
- **Health check**: `/api/health`

### 🌐 Client (Angular SSR)

- **Container**: `web-nosime-client`
- **Port**: `4000:4000`
- **Build**: `./client/Dockerfile`
- **Phụ thuộc**: Chờ server khởi động

## 🔧 Environment Variables

### Database

- `SA_PASSWORD=Nosime44@`
- `MSSQL_PID=Express`

### Server

- `DB_SERVER=database`
- `DB_PORT=1433`
- `DB_USER=sa`
- `DB_PASSWORD=Nosime44@`
- `DB_NAME=MovieDB`

### Client

- `API_URL=http://localhost:5000/api`

## 📝 Các lệnh hữu ích

### Xem logs

```bash
# Tất cả services
docker-compose logs

# Service cụ thể
docker-compose logs server
docker-compose logs client
docker-compose logs database
```

### Dừng services

```bash
docker-compose down
```

### Dừng và xóa volumes

```bash
docker-compose down -v
```

### Rebuild service cụ thể

```bash
docker-compose up --build server
```

### Truy cập container

```bash
docker-compose exec server bash
docker-compose exec client sh
```

## 🌍 Truy cập ứng dụng

- **Frontend**: http://localhost:4000
- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health
- **Database**: localhost:14330 (từ host machine)

## 🔍 Troubleshooting

### Database connection issues

1. Kiểm tra health check: `docker-compose ps`
2. Xem logs database: `docker-compose logs database`
3. Restart database: `docker-compose restart database`

### Migration fails

1. Xem logs: `docker-compose logs db-migrate`
2. Kiểm tra file SQL: `server/database/db_webphim.sql`
3. Chạy lại migration: `docker-compose up db-migrate --force-recreate`

### Server won't start

1. Kiểm tra database đã ready: `docker-compose ps`
2. Xem logs: `docker-compose logs server`
3. Kiểm tra environment variables trong docker-compose.yml
