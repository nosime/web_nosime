const sql = require('mssql');
const db = require('../../../database/database');

// Search movies với phân trang
async function searchMovies(req, res) {
    let pool;
    try {
        // Lấy connection từ pool
        pool = await db.getConnection();
        
        
        const searchTerm = req.query.q || '';
        const page = parseInt(req.query.page) || 1;
        const limitItems = 24;
        const offset = (page - 1) * limitItems;

        const countResult = await pool.request()
            .input('searchTerm', sql.NVarChar, `%${searchTerm}%`)
            .query(`
                SELECT COUNT(*) as total 
                FROM Movies 
                WHERE IsVisible = 1 
                AND (Name LIKE @searchTerm 
                OR OriginName LIKE @searchTerm 
                OR Slug LIKE @searchTerm)
            `);

        const totalMovies = countResult.recordset[0].total;
        const totalPages = Math.ceil(totalMovies / limitItems);
                
        const result = await pool.request()
            .input('searchTerm', sql.NVarChar, `%${searchTerm}%`)
            .input('offset', sql.Int, offset)
            .input('limitItems', sql.Int, limitItems)
            .query(`
                SELECT 
                    m.MovieID,
                    m.Name,
                    m.OriginName,
                    m.Slug,
                    m.Type,
                    m.Status, 
                    m.ThumbUrl,
                    m.PosterUrl,
                    m.BannerUrl,
                    m.TrailerUrl,
                    m.Episode_Current,
                    m.Episode_Total,
                    m.Quality,
                    m.Language as Lang,
                    m.Views,
                    m.Year,
                    (
                        SELECT STRING_AGG(c.Name, ',')
                        FROM Categories c
                        INNER JOIN MovieCategories mc ON c.CategoryID = mc.CategoryID
                        WHERE mc.MovieID = m.MovieID
                    ) as Categories,
                    (
                        SELECT STRING_AGG(co.Name, ',')
                        FROM Countries co
                        INNER JOIN MovieCountries mco ON co.CountryID = mco.CountryID
                        WHERE mco.MovieID = m.MovieID
                    ) as Countries
                FROM Movies m
                WHERE m.IsVisible = 1
                AND (m.Name LIKE @searchTerm 
                    OR m.OriginName LIKE @searchTerm 
                    OR m.Slug LIKE @searchTerm)
                ORDER BY m.CreatedAt DESC
                OFFSET @offset ROWS
                FETCH NEXT @limitItems ROWS ONLY
            `);

        res.json({
            success: true,
            data: result.recordset,
            pagination: {
                page,
                limitItems,
                totalItems: totalMovies,
                totalPages
            }
        });

  
    } catch (error) {
        console.error('Lỗi server khi lấy danh sách tìm kiếm phim:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    
    
        res.status(500).json({
          success: false,
          message: 'Lỗi server khi lấy danh sách tìm kiếm phim',
          error: error.message
        });
      }
}

async function searchMoviesType(req, res) {
    let pool;
    try {
      pool = await db.getConnection();
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 24;
      const offset = (page - 1) * limit;
  
      let whereConditions = ['m.IsVisible = 1'];
      let params = new Map();
  
      // Build dynamic where clause
      if (req.query.types) {
        whereConditions.push('m.Type IN (@types)');
        params.set('types', req.query.types.split(','));
      }
  
      if (req.query.categories) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM MovieCategories mc 
          JOIN Categories c ON mc.CategoryID = c.CategoryID
          WHERE mc.MovieID = m.MovieID AND c.Slug IN (@categories)
        )`);
        params.set('categories', req.query.categories.split(','));
      }
  
      if (req.query.countries) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM MovieCountries mc
          JOIN Countries c ON mc.CountryID = c.CountryID 
          WHERE mc.MovieID = m.MovieID AND c.Slug IN (@countries)
        )`);
        params.set('countries', req.query.countries.split(','));
      }
  
      if (req.query.years) {
        whereConditions.push('m.Year IN (@years)');
        params.set('years', req.query.years.split(',').map(Number));
      }
  
      const whereClause = whereConditions.join(' AND ');
      const request = pool.request();
  
      // Add parameters
      params.forEach((value, key) => {
        request.input(key, Array.isArray(value) ? sql.VarChar : sql.Int, value);
      });
      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, limit);
  
      const result = await request.query(`
        SELECT m.*, 
          (SELECT STRING_AGG(c.Name, ',') FROM MovieCategories mc 
           JOIN Categories c ON mc.CategoryID = c.CategoryID 
           WHERE mc.MovieID = m.MovieID) as Categories,
          (SELECT STRING_AGG(c.Name, ',') FROM MovieCountries mc
           JOIN Countries c ON mc.CountryID = c.CountryID
           WHERE mc.MovieID = m.MovieID) as Countries,
          COUNT(*) OVER() as TotalCount
        FROM Movies m
        WHERE ${whereClause} 
        ORDER BY m.CreatedAt DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);
  
      const totalItems = result.recordset[0]?.TotalCount || 0;
  
      res.json({
        success: true,
        data: result.recordset,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit)
        }
      });
  
    } catch (error) {
      console.error('Search error:', error);
      if (pool) await pool.close();
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  

module.exports = {
    searchMovies,
    searchMoviesType
};