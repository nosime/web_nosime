const axios = require('axios');
const sql = require('mssql');
const config = require('../../database/config');

// Function để fetch countries từ ophim1 API 
async function fetchOphimCountries() {
  try {
    const response = await axios.get('https://ophim1.com/quoc-gia');
    return response.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
}

// Function để insert country vào database
async function insertCountry(country, pool) {
  try {
    await pool.request()
      .input('Name', sql.NVarChar(100), country.name)
      .input('Slug', sql.NVarChar(100), country.slug)
      .input('Code', sql.VarChar(10), country.slug.toUpperCase().substring(0, 10))
      .input('IsActive', sql.Bit, 1)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM Countries WHERE Slug = @Slug)
        INSERT INTO Countries (Name, Slug, Code, IsActive)
        VALUES (@Name, @Slug, @Code, @IsActive)
      `);
  } catch (error) {
    console.error(`Error inserting country ${country.name}:`, error);
    throw error;
  }
}

// Main function để sync countries
async function syncCountries(req, res) {
  let pool;
  try {
    // Kết nối database
    pool = await sql.connect(config);
    
    // Fetch countries từ ophim1
    const countries = await fetchOphimCountries();
    
    // Insert từng country vào database
    for (const country of countries) {
      await insertCountry(country, pool);
    }

    // Query lấy tất cả countries sau khi sync
    const result = await pool.request()
      .query('SELECT * FROM Countries ORDER BY Name');
    
    res.json({
      success: true,
      message: 'Countries synced successfully',
      data: result.recordset
    });

  } catch (error) {
    console.error('Error in syncCountries:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing countries',
      error: error.message
    });
  } finally {
    if (pool) {
      pool.close();
    }
  }
}

// Function để lấy danh sách countries
async function getCountries(req, res) {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request()
      .query('SELECT * FROM Countries ORDER BY Name');
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error getting countries:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (pool) {
      pool.close();
    }
  }
}

// Function để lấy country theo ID
async function getCountryById(req, res) {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request()
      .input('CountryID', sql.Int, req.params.id)
      .query('SELECT * FROM Countries WHERE CountryID = @CountryID');
    
    if (result.recordset.length > 0) {
      res.json({
        success: true,
        data: result.recordset[0]
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Country not found'
      });
    }
  } catch (error) {
    console.error('Error getting country by ID:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (pool) {
      pool.close();
    }
  }
}

module.exports = {
  syncCountries,
  getCountries,
  getCountryById
};