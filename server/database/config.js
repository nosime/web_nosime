const config = {
  server: 'localhost',
  port: 14330,
  user: 'sa',
  password: 'Nosime44@',
  database: 'MovieDB', // Đổi thành master để có thể tạo database mới
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
    encrypt: false
  }
};

module.exports = config;

