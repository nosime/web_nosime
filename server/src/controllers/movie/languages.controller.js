const sql = require("mssql");
const db = require('../../../database/database');

async function getUniqueLanguages(req, res) {
  let pool;
  try {
    pool = await db.getConnection();

    const result = await pool.request().query(`
        SELECT DISTINCT Language as name, 
               LOWER(Language) as slug
        FROM Movies 
        WHERE Language IS NOT NULL 
        AND Language != ''
        ORDER BY Language
      `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    if (pool) pool.close();
  }
}

module.exports = {
  getUniqueLanguages,
};
