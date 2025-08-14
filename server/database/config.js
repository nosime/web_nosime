// database/config.js
const dbType = process.env.DB_TYPE || "mssql";

const configs = {
  // SQL Server config
  mssql: {
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
  },

  // PostgreSQL config
  postgres: {
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
  },
};

module.exports = {
  dbType,
  ...configs[dbType],
};
