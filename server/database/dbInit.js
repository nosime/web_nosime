// database/dbInit.js - PostgreSQL only for ARM64 branch
const db = require('./database');

async function initDatabase() {
  try {
    const pool = await db.getConnection();
    console.log('Connected to PostgreSQL');
    
    try {
      const result = await db.query(`
        SELECT 
          'Categories' AS table_name, COUNT(*) AS record_count FROM categories
        UNION ALL
          SELECT 'Countries', COUNT(*) FROM countries
        UNION ALL
          SELECT 'Movies', COUNT(*) FROM movies
        UNION ALL
          SELECT 'MovieCategories', COUNT(*) FROM moviecategories
        UNION ALL
          SELECT 'MovieCountries', COUNT(*) FROM moviecountries
        UNION ALL
          SELECT 'Servers', COUNT(*) FROM servers
        UNION ALL
          SELECT 'Episodes', COUNT(*) FROM episodes
        UNION ALL
          SELECT 'Roles', COUNT(*) FROM roles
        UNION ALL
          SELECT 'Permissions', COUNT(*) FROM permissions
        UNION ALL
          SELECT 'RolePermissions', COUNT(*) FROM rolepermissions
        UNION ALL
          SELECT 'Users', COUNT(*) FROM users
        UNION ALL
          SELECT 'UserRoles', COUNT(*) FROM userroles
        UNION ALL
          SELECT 'ViewHistory', COUNT(*) FROM viewhistory
        UNION ALL
          SELECT 'WatchLater', COUNT(*) FROM watchlater
        UNION ALL
          SELECT 'MovieRatings', COUNT(*) FROM movieratings
        ORDER BY table_name;
      `);

      if (result.recordset && result.recordset.length > 0) {
        console.log('\nDatabase Tables Status:');
        console.table(
          result.recordset.map(item => ({
            'Table Name': item.table_name,
            'Record Count': parseInt(item.record_count)
          }))
        );
      } else {
        console.log('No tables found in database');
      }

      return true;

    } catch (err) {
      throw err;
    }

  } catch (err) {
    console.error('PostgreSQL connection error:', err);
    
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      console.log('Connection refused, attempting to reconnect...');
      await db.closePool();
      return initDatabase();
    }
    
    console.error('Error details:', {
      code: err.code,
      message: err.message,
      severity: err.severity,
      detail: err.detail
    });

    return false;
  }
}

// Event handlers
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await db.closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Termination signal received...');
  await db.closePool();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = initDatabase;