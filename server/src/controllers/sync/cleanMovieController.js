// cleanMovieController.js

const sql = require('mssql');
const config = require('../../../database/config');

async function cleanAllMovieData(req, res) {
  let pool;
  try {
    pool = await sql.connect(config);
    console.log('Starting clean up process...');

    // Thực hiện xóa theo thứ tự để tránh vi phạm ràng buộc khóa ngoại
    const cleanupSteps = [
      {
        name: 'Episodes',
        query: 'DELETE FROM Episodes'
      },
      {
        name: 'Servers',
        query: 'DELETE FROM Servers'
      },
      {
        name: 'MovieCategories',
        query: 'DELETE FROM MovieCategories'
      },
      {
        name: 'MovieCountries', 
        query: 'DELETE FROM MovieCountries'
      },
      {
        name: 'ViewHistory',
        query: 'DELETE FROM ViewHistory'
      },
      {
        name: 'WatchLater',
        query: 'DELETE FROM WatchLater'
      },
      {
        name: 'MovieRatings',
        query: 'DELETE FROM MovieRatings'
      },
      {
        name: 'Movies',
        query: 'DELETE FROM Movies'
      }
    ];

    const results = {
      success: [],
      failed: []
    };

    // Thực hiện xóa từng bảng
    for (const step of cleanupSteps) {
      try {
        console.log(`Cleaning ${step.name}...`);
        
        // Get count before delete
        const beforeCount = await pool.request()
          .query(`SELECT COUNT(*) as count FROM ${step.name}`);

        // Perform delete
        await pool.request().query(step.query);

        // Get count after delete
        const afterCount = await pool.request()
          .query(`SELECT COUNT(*) as count FROM ${step.name}`);

        results.success.push({
          table: step.name,
          deletedRecords: beforeCount.recordset[0].count - afterCount.recordset[0].count,
          remainingRecords: afterCount.recordset[0].count
        });

        console.log(`Successfully cleaned ${step.name}`);

      } catch (error) {
        console.error(`Error cleaning ${step.name}:`, error);
        results.failed.push({
          table: step.name,
          error: error.message
        });
      }
    }

    // Reset identity columns where applicable
    try {
      await pool.request().query(`
        DBCC CHECKIDENT ('Movies', RESEED, 0);
        DBCC CHECKIDENT ('Episodes', RESEED, 0);
        DBCC CHECKIDENT ('Servers', RESEED, 0);
      `);
    } catch (error) {
      console.error('Error resetting identity columns:', error);
    }

    res.json({
      success: true,
      message: 'Database cleanup completed',
      results
    });

  } catch (error) {
    console.error('Error in cleanAllMovieData:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    if (pool) {
      pool.close();
    }
  }
}

module.exports = {
  cleanAllMovieData
};