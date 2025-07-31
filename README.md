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

### Prerequisites

- Node.js 18+
- SQL Server
- Angular CLI

### Installation

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

## 🌐 API Endpoints

- `/api/auth/*` - Authentication routes
- `/api/movies/*` - Movie data and streaming
- `/api/search/*` - Search functionality
- `/api/admin/*` - Admin panel operations
- `/api/sync/*` - Data synchronization

## 🔐 Environment Variables

Create `.env` file in the server directory:

```env
JWT_SECRET=your_jwt_secret
DB_SERVER=your_db_server
DB_DATABASE=your_database_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

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
