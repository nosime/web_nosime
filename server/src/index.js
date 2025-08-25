const express = require("express");
const cors = require("cors");
const path = require("path");
const sql = require("mssql");
const initDatabase = require("../database/dbInit");

const authRoutes = require("./routes/auth.routes");
const actionRoutes = require("./routes/action.routes");
const movieRoutes = require("./routes/movie.routes");
const searchRoutes = require("./routes/search.routes");
const syncRoutes = require("./routes/sync.routes");
const adminRoutes = require("./routes/admin.routes");
const profileRoutes = require("./routes/profile.routes");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files for uploaded avatars
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const PORT = process.env.PORT || 5000;

// Khởi động server sau khi kết nối DB thành công
initDatabase()
  .then((success) => {
    if (success) {
      // Health check endpoint
      app.get("/api/health", (req, res) => {
        res
          .status(200)
          .json({ status: "OK", timestamp: new Date().toISOString() });
      });

      app.use("/api/auth", authRoutes);
      app.use("/api", actionRoutes, searchRoutes, syncRoutes, movieRoutes);
      app.use("/api/profile", profileRoutes);

      app.use("/api/admin", adminRoutes);

      // Start server
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } else {
      console.error("Failed to initialize database");
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
