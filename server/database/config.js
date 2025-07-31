// database/config.js
module.exports = {
  server: 'localhost',
  port: 14330,
  user: 'sa',
  password: 'Nosime44@',
  database: 'MovieDB',
  options: {
      trustServerCertificate: true,
      encrypt: false,
      enableArithAbort: true,
      connectionTimeout: 30000,
      requestTimeout: 30000
  },
  pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 300000,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      createRetryIntervalMillis: 2000
  }
};