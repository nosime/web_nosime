# 🎬 Web Nosime - Movie Streaming Platform

A full-stack movie streaming web application built with modern technologies.

## 🚀 Tech Stack

### Frontend

- **Angular 18** - Modern web framework
- **TypeScript** - Type-safe development
- **Angular Material & MDBootstrap** - UI components
- **Chart.js** - Data visualization
- **Owl Carousel** - Image/video carousel

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication
- **bcryptjs** - Password encryption
- **CORS** - Cross-origin resource sharing

### Database

- **SQL Server (MSSQL)** - Primary database
- **Database migrations** - Schema management

## 📁 Project Structure

```
web_nosime/
├── client/                 # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # UI components
│   │   │   ├── services/   # Angular services
│   │   │   └── guards/     # Route guards
│   │   └── assets/         # Static assets
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── middleware/     # Custom middleware
│   │   └── routes/         # API routes
│   └── database/           # Database config & migrations
└── README.md
```

## 🛠️ Features

- 🎥 Movie streaming and playback
- 👤 User authentication and authorization
- 📱 Responsive design for all devices
- 🔍 Advanced search and filtering
- ⭐ Movie rating and reviews
- 📊 Admin dashboard for content management
- 📈 View history tracking
- 💾 Watch later functionality
- 🎯 Personalized recommendations

## 🚀 Getting Started

### 🐳 Method 1: Run with Docker (Recommended)

#### Prerequisites

- Docker Desktop
- Docker Compose

#### Quick Start

```bash
# Clone the repository
git clone git@github.com:nosime/web_nosime.git
cd web_nosime

# Fix Git line endings (important for Windows users)
git config core.autocrlf false

# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

#### Services Overview

- **Database**: SQL Server 2019 → `localhost:14330`
- **API Server**: Node.js → `localhost:5000`
- **Frontend**: Angular SSR → `localhost:4000`

#### Access URLs

- 🌐 **Web Application**: http://localhost:4000
- 🔌 **API Endpoint**: http://localhost:5000/api
- ❤️ **Health Check**: http://localhost:5000/api/health
- 🗄️ **Database**: `localhost:14330` (sa/Nosime44@)

#### Default Login Credentials

- 👤 **Admin Account**:
  - Username: `admin`
  - Password: `admin123`

#### Useful Docker Commands

```bash
# View logs
docker-compose logs -f                # All services
docker-compose logs -f server        # Server only
docker-compose logs -f client        # Client only
docker-compose logs -f database      # Database only

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild specific service
docker-compose up --build server

# Access container shell
docker-compose exec server bash
docker-compose exec client sh
```

#### Troubleshooting Docker

1. **Entrypoint errors**: Ensure line endings are LF (not CRLF)
2. **Database connection**: Wait for health check to pass
3. **Build failures**: Check logs with `docker-compose logs [service]`
4. **Permission issues**: Try running Docker as administrator

---

### 💻 Method 2: Local Development

#### Prerequisites

- Node.js 18+
- SQL Server
- Angular CLI

#### Installation

1. **Clone the repository**

   ```bash
   git clone git@github.com:nosime/web_nosime.git
   cd web_nosime
   ```

2. **Install dependencies**

   ```bash
   npm run install-all
   ```

3. **Setup database**

   - Configure database connection in `server/database/config.js`
   - Run migrations: `cd server && npm run migrate`

4. **Start development servers**
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run client` - Start Angular dev server only
- `npm run server` - Start Node.js server only
- `npm run install-all` - Install dependencies for both client and server

## 🐳 Docker Configuration

### Docker Compose Services

```yaml
services:
  database: # SQL Server 2019 Express
  server: # Node.js API (Port 5000)
  client: # Angular SSR (Port 4000)
```

### Environment Variables

#### Database

- `SA_PASSWORD=Nosime44@`
- `MSSQL_PID=Express`

#### Server

- `DB_SERVER=database`
- `DB_USER=sa`
- `DB_PASSWORD=Nosime44@`
- `DB_NAME=MovieDB`

#### Client

- `API_URL=http://localhost:5000/api`

### Docker Network

All services run on `web-nosime-network` bridge network for internal communication.

---

- `/api/auth/*` - Authentication routes
- `/api/movies/*` - Movie data and streaming
- `/api/search/*` - Search functionality
- `/api/admin/*` - Admin panel operations
- `/api/sync/*` - Data synchronization

## 🌐 API Endpoints

## 🔐 Environment Variables (Local Development)

Create `.env` file in the server directory:

```env
JWT_SECRET=your_jwt_secret
DB_SERVER=your_db_server
DB_DATABASE=your_database_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

> **Note**: When using Docker, environment variables are automatically configured in `docker-compose.yml`

---

## 🚨 Troubleshooting

### Docker Issues

#### Common Problems:

1. **Entrypoint file not found**

   ```bash
   # Fix line endings for Windows users
   git config core.autocrlf false
   git rm --cached -r .
   git reset --hard
   ```

2. **Database connection failed**

   ```bash
   # Check database health
   docker-compose ps
   docker-compose logs database

   # Restart database if needed
   docker-compose restart database
   ```

3. **Server won't start**

   ```bash
   # Check server logs
   docker-compose logs server

   # Ensure database is ready
   docker-compose up database
   # Wait for "SQL Server is now ready for client connections"
   ```

4. **Client build errors**

   ```bash
   # Check client logs
   docker-compose logs client

   # Rebuild client only
   docker-compose up --build client
   ```

5. **Port conflicts**

   ```bash
   # Check what's using the ports
   netstat -an | findstr "4000\|5000\|14330"

   # Stop conflicting services or change ports in docker-compose.yml
   ```

### Development Issues

#### Angular/Node.js Setup:

- Ensure Node.js 18+ is installed
- Run `npm run install-all` in project root
- Check Angular CLI: `ng version`

#### Database Setup:

- Install SQL Server Express
- Configure connection in `server/database/config.js`
- Run migrations: `cd server && npm run migrate`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Nosime**

- GitHub: [@nosime](https://github.com/nosime)
- Email: voson0404@gmail.com

---

⭐ Star this repository if you find it helpful!
