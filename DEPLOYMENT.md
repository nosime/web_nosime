# 🚀 Deployment Guide

## GitHub Actions Workflows

Dự án này có 2 workflows để deploy:

### 1. `main.yml` - Auto Deployment

- **Trigger**: Push to branch `main` hoặc `production`
- **Mục đích**: Deploy tự động khi có thay đổi code
- **Thời gian**: ~2-3 phút

### 2. `production.yml` - Production Deployment

- **Trigger**: Push to branch `production` hoặc manual dispatch
- **Mục đích**: Deploy production với đầy đủ health checks và backup
- **Thời gian**: ~3-5 phút
- **Tính năng**:
  - ✅ Backup tự động trước khi deploy
  - ✅ Health checks chi tiết cho tất cả services
  - ✅ Resource monitoring
  - ✅ Rollback support
  - ✅ Cleanup tự động

## 🔧 Setup Requirements

### Server Requirements

```bash
# Tạo thư mục dự án trên server
sudo mkdir -p /root/services/web_nosime
sudo mkdir -p /root/backups

# Clone repository
cd /root/services
git clone <repository-url> web_nosime
cd web_nosime

# Đảm bảo Docker và Docker Compose đã cài đặt
docker --version
docker-compose --version
```

### GitHub Secrets

Cần setup các secrets sau trong GitHub repository:

| Secret     | Mô tả                             | Ví dụ           |
| ---------- | --------------------------------- | --------------- |
| `HOST`     | IP address hoặc domain của server | `192.168.1.100` |
| `USERNAME` | Username SSH                      | `root`          |
| `PASSWORD` | Password SSH                      | `your-password` |

**Cách thêm secrets:**

1. Vào repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Thêm từng secret ở trên

## 🎯 Deployment Process

### Automatic Deployment

```bash
# Chỉ cần push code lên main branch
git push origin main
```

### Manual Production Deployment

1. Vào GitHub repository
2. Actions tab → "Web Nosime Production Deployment"
3. Click "Run workflow"
4. Chọn environment và click "Run workflow"

## 🔍 Monitoring & Troubleshooting

### Kiểm tra logs deployment

```bash
# Xem logs trong GitHub Actions
# Hoặc SSH vào server và kiểm tra:

cd /root/services/web_nosime

# Xem trạng thái containers
docker-compose ps

# Xem logs
docker-compose logs -f

# Xem logs từng service
docker-compose logs server
docker-compose logs client
docker-compose logs database
```

### Health Check Endpoints

- **Server API**: `http://your-domain:5000/api/health`
- **Client**: `http://your-domain:4000`
- **Database**: Internal health check qua TCP port 1433

### Rollback Process

```bash
# SSH vào server
ssh root@your-server

# Xem danh sách backup
ls -la /root/backups/

# Restore từ backup (thay date_time bằng backup muốn restore)
cd /root/services/web_nosime
docker-compose down
cp -r /root/backups/web_nosime_YYYYMMDD_HHMMSS/* .
docker-compose up -d
```

## 🛠️ Customization

### Thay đổi ports

Sửa file `docker-compose.yml`:

```yaml
services:
  client:
    ports:
      - "3000:4000" # Thay đổi port external
  server:
    ports:
      - "8000:5000" # Thay đổi port external
```

### Environment Variables

Thêm environment variables trong `docker-compose.yml`:

```yaml
services:
  server:
    environment:
      - NODE_ENV=production
      - API_KEY=${API_KEY}
      - CUSTOM_CONFIG=${CUSTOM_CONFIG}
```

### Database Configuration

Thay đổi password và cấu hình database:

```yaml
services:
  database:
    environment:
      - SA_PASSWORD=YourStrongPassword123!
      - MSSQL_PID=Express
```

## 🚨 Troubleshooting

### Lỗi thường gặp:

1. **Container không start**

   ```bash
   docker-compose logs [service-name]
   docker system df  # Kiểm tra disk space
   ```

2. **Database connection failed**

   ```bash
   # Kiểm tra database logs
   docker-compose logs database

   # Test connection
   docker-compose exec database /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'Nosime44@'
   ```

3. **Port conflicts**

   ```bash
   # Kiểm tra ports đang sử dụng
   netstat -tulpn | grep :5000
   netstat -tulpn | grep :4000
   ```

4. **Out of disk space**

   ```bash
   # Cleanup Docker
   docker system prune -a --volumes

   # Cleanup old backups
   rm -rf /root/backups/web_nosime_old_*
   ```

## 📈 Performance Tips

1. **Enable Docker BuildKit** cho build nhanh hơn
2. **Use .dockerignore** để loại bỏ files không cần thiết
3. **Multi-stage builds** để giảm image size
4. **Health checks** để đảm bảo services stable trước khi deploy
5. **Resource limits** để tránh container sử dụng quá nhiều tài nguyên

## 🔒 Security Notes

- Đổi default passwords trong production
- Sử dụng SSH keys thay vì password nếu có thể
- Giới hạn access ports qua firewall
- Regular backup và test restore process
- Monitor logs cho security issues
