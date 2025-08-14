// database/migration.js - PostgreSQL only for ARM64 branch
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const config = require("./config");

async function dropAndCreateDatabase() {
  try {
    // Kết nối với postgres database
    const adminConfig = {
      ...config,
      database: 'postgres'
    };
    let client = new Client(adminConfig);
    await client.connect();

    console.log('Đang kiểm tra và xóa database cũ...');

    // Xóa database nếu tồn tại
    try {
      await client.query(`DROP DATABASE IF EXISTS "${config.database}"`);
      console.log('Database cũ đã được xóa (nếu tồn tại)');
    } catch (error) {
      console.log('Không thể xóa database (có thể không tồn tại)');
    }

    console.log('Đang tạo database mới...');

    // Tạo database mới
    await client.query(`CREATE DATABASE "${config.database}"`);
    await client.end();

    console.log('Database mới đã được tạo');
    console.log('Đang tạo các bảng...');

    // Kết nối với database MovieDB
    client = new Client(config);
    await client.connect();

    // Đọc nội dung file SQL
    const sqlContent = fs.readFileSync(path.join(__dirname, 'db_webphim.sql'), 'utf8');

    // Chia và thực thi từng batch SQL
    const queries = sqlContent
      .replace(/--.*$/gm, "") // Remove single line comments
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0);

    for (let i = 0; i < queries.length; i++) {
      try {
        await client.query(queries[i]);
        console.log(`Query ${i + 1}/${queries.length} thực thi thành công`);
      } catch (err) {
        if (err.message.includes("already exists")) {
          console.log(`Query ${i + 1}/${queries.length}: Already exists (skipped)`);
        } else {
          console.error(`Lỗi khi thực thi query ${i + 1}:`, err.message);
          console.error("Query:", queries[i].substring(0, 200) + "...");
        }
      }
    }

    console.log('Tất cả các bảng đã được tạo thành công');
    await client.end();

  } catch (err) {
    console.error('Lỗi trong quá trình migration:', err);
    throw err;
  }
}

// Chạy migration
dropAndCreateDatabase().then(() => {
  console.log('Migration hoàn tất thành công');
  process.exit(0);
}).catch(err => {
  console.error('Migration thất bại:', err);
  process.exit(1);
});
