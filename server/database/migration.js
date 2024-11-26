// db/migration.js
const sql = require('mssql');
const config = require('./config');
const fs = require('fs');
const path = require('path');

async function dropAndCreateDatabase() {
  try {
    // Kết nối với master database
    let pool = await sql.connect({
      ...config,
      database: 'master'
    });

    console.log('Đang kiểm tra và xóa database cũ...');

    // Xóa kết nối tới database cũ và xóa database
    await pool.request().query(`
      IF EXISTS (SELECT * FROM sys.databases WHERE name = 'MovieDB')
      BEGIN
          USE master;
          ALTER DATABASE MovieDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
          DROP DATABASE MovieDB;
      END
    `);

    console.log('Database cũ đã được xóa (nếu tồn tại)');
    console.log('Đang tạo database mới...');

    // Tạo database mới
    await pool.request().query(`CREATE DATABASE MovieDB`);

    // Đổi sang database MovieDB
    await pool.close();

    // Kết nối với database MovieDB
    pool = await sql.connect({
      ...config,
      database: 'MovieDB'
    });

    console.log('Database mới đã được tạo');
    console.log('Đang tạo các bảng...');

    // Đọc nội dung file SQL
    const sqlContent = fs.readFileSync(path.join(__dirname, 'db_webphim.sql'), 'utf8');

    // Chia và thực thi từng batch SQL
    const batches = sqlContent
      .split('GO')
      .map(batch => batch.trim())
      .filter(batch => batch.length > 0);

    for (let i = 0; i < batches.length; i++) {
      try {
        await pool.request().query(batches[i]);
        console.log(`Batch ${i + 1}/${batches.length} thực thi thành công`);
      } catch (err) {
        console.error(`Lỗi khi thực thi batch ${i + 1}:`, err);
        throw err;
      }
    }

    console.log('Tất cả các bảng đã được tạo thành công');
    await pool.close();

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
