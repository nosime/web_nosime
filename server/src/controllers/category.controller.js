const axios = require('axios');
const sql = require('mssql');
const config = require('../../database/config');

// Function để fetch categories từ ophim1 API
async function fetchOphimCategories() {
  try {
    const response = await axios.get('https://ophim1.com/the-loai');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

// Function để insert category vào database
async function insertCategory(category, pool) {
  try {
    await pool.request()
      .input('Name', sql.NVarChar(100), category.name)
      .input('Slug', sql.NVarChar(100), category.slug)
      .input('Description', sql.NVarChar(500), `Thể loại ${category.name}`)
      .input('DisplayOrder', sql.Int, 0)
      .input('IsActive', sql.Bit, 1)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM Categories WHERE Slug = @Slug)
        INSERT INTO Categories (Name, Slug, Description, DisplayOrder, IsActive)
        VALUES (@Name, @Slug, @Description, @DisplayOrder, @IsActive)
      `);
  } catch (error) {
    console.error(`Error inserting category ${category.name}:`, error);
    throw error;
  }
}

// Main function để sync categories
async function syncCategories(req, res) {
  let pool;
  try {
    // Kết nối database
    pool = await sql.connect(config);
    
    // Fetch categories từ ophim1
    const categories = await fetchOphimCategories();
    
    // Insert từng category vào database
    for (const category of categories) {
      await insertCategory(category, pool);
    }

    // Query lấy tất cả categories sau khi sync
    const result = await pool.request()
      .query('SELECT * FROM Categories ORDER BY DisplayOrder, Name');
    
    res.json({
      success: true,
      message: 'Categories synced successfully',
      data: result.recordset
    });

  } catch (error) {
    console.error('Error in syncCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing categories',
      error: error.message
    });
  } finally {
    if (pool) {
      pool.close();
    }
  }
}

module.exports = {
  syncCategories
};