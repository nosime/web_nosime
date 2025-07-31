// database/dbInit.js
const sql = require('mssql');
const db = require('./database');

async function initDatabase() {
  try {
    const pool = await db.getConnection();
    console.log('Connected to SQL Server');
    
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      const result = await transaction.request()
        .query(`
          SELECT 
            'Categories' AS TableName, COUNT(*) AS RecordCount FROM Categories
          UNION ALL
            SELECT 'Countries', COUNT(*) FROM Countries
          UNION ALL
            SELECT 'Movies', COUNT(*) FROM Movies
          UNION ALL
            SELECT 'MovieCategories', COUNT(*) FROM MovieCategories
          UNION ALL
            SELECT 'MovieCountries', COUNT(*) FROM MovieCountries
          UNION ALL
            SELECT 'Servers', COUNT(*) FROM Servers
          UNION ALL
            SELECT 'Episodes', COUNT(*) FROM Episodes
          UNION ALL
            SELECT 'Roles', COUNT(*) FROM Roles
          UNION ALL
            SELECT 'Permissions', COUNT(*) FROM Permissions
          UNION ALL
            SELECT 'RolePermissions', COUNT(*) FROM RolePermissions
          UNION ALL
            SELECT 'Users', COUNT(*) FROM Users
          UNION ALL
            SELECT 'UserRoles', COUNT(*) FROM UserRoles
          UNION ALL
            SELECT 'ViewHistory', COUNT(*) FROM ViewHistory
          UNION ALL
            SELECT 'WatchLater', COUNT(*) FROM WatchLater
          UNION ALL
            SELECT 'MovieRatings', COUNT(*) FROM MovieRatings
          ORDER BY TableName;
        `);

      await transaction.commit();

      if (result.recordset && result.recordset.length > 0) {
        console.log('\nDatabase Tables Status:');
        console.table(
          result.recordset.map(item => ({
            'Table Name': item.TableName,
            'Record Count': item.RecordCount
          }))
        );
      } else {
        console.log('No tables found in database');
      }

      return true;

    } catch (err) {
      await transaction.rollback();
      throw err;
    }

  } catch (err) {
    console.error('SQL Server connection error:', err);
    
    if (err.code === 'ECONNCLOSED') {
      console.log('Connection closed, attempting to reconnect...');
      await db.closePool();
      return initDatabase();
    }
    
    console.error('Error details:', {
      code: err.code,
      message: err.message,
      state: err.state,
      class: err.class
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