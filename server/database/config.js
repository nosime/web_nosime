// database/config.js - PostgreSQL only for ARM64 branch
module.exports = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "nosime",
  password: process.env.DB_PASSWORD || "Nosime44@",
  database: process.env.DB_NAME || "MovieDB",
  max: 10,
  min: 0,
  idleTimeoutMillis: 300000,
  acquireTimeoutMillis: 30000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  createRetryIntervalMillis: 2000,
};
