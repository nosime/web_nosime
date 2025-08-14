// database/config.js
module.exports = {
  server: process.env.DB_SERVER || "localhost",
  port: parseInt(process.env.DB_PORT) || 14330,
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "Nosime44@",
  database: process.env.DB_NAME || "MovieDB",
  options: {
    trustServerCertificate: true,
    encrypt: false,
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 300000,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    createRetryIntervalMillis: 2000,
  },
};
