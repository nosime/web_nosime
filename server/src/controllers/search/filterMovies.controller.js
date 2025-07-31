const sql = require('mssql');
const db = require('../../../database/database');

async function filterMovies(req, res) {
   let pool;
   try {
     pool = await db.getConnection();
     
     const page = parseInt(req.query.page) || 1;
     const limit = 24;
     let offset = (page - 1) * limit;
 
     let conditions = ['m.IsVisible = 1'];
     let request = pool.request();
     request.input('offset', sql.Int, offset);
     request.input('limit', sql.Int, limit);
 
     // Xử lý filter loại phim
     if (req.query.types) {
       const types = req.query.types.split(',');
       const typeParams = types.map((type, i) => {
         const paramName = `type${i}`;
         request.input(paramName, sql.VarChar, type); 
         return `@${paramName}`;
       });
       conditions.push(`m.Type IN (${typeParams.join(',')})`);
     }

     // Xử lý filter thể loại 
     if (req.query.categories && req.query.categories.length > 0) {
       const categories = req.query.categories.split(',');
       const categoryParams = categories.map((cat, i) => {
         const paramName = `category${i}`;
         request.input(paramName, sql.NVarChar, cat);
         return `@${paramName}`; 
       });

       conditions.push(`
         EXISTS (
           SELECT 1 FROM MovieCategories mc
           JOIN Categories c ON mc.CategoryID = c.CategoryID
           WHERE mc.MovieID = m.MovieID 
           AND c.Slug IN (${categoryParams.join(',')})
         )
       `);
     }

     // Xử lý filter quốc gia
     if (req.query.countries && req.query.countries.length > 0) {
       const countries = req.query.countries.split(',');
       const countryParams = countries.map((country, i) => {
         const paramName = `country${i}`;
         request.input(paramName, sql.NVarChar, country);
         return `@${paramName}`;
       });

       conditions.push(`
         EXISTS (
           SELECT 1 FROM MovieCountries mc
           JOIN Countries c ON mc.CountryID = c.CountryID
           WHERE mc.MovieID = m.MovieID 
           AND c.Slug IN (${countryParams.join(',')})
         )
       `);
     }

     // Xử lý filter trạng thái
     if (req.query.status && req.query.status.length > 0) {
       const statuses = req.query.status.split(',');
       const statusParams = statuses.map((status, i) => {
         const paramName = `status${i}`;
         request.input(paramName, sql.VarChar, status);
         return `@${paramName}`;
       });
       conditions.push(`m.Status IN (${statusParams.join(',')})`);
     }

     // Xử lý filter năm
     if (req.query.years && req.query.years.length > 0) {
       const years = req.query.years.split(',').map(Number);
       const yearParams = years.map((year, i) => {
         const paramName = `year${i}`;
         request.input(paramName, sql.Int, year);
         return `@${paramName}`;
       });
       conditions.push(`m.Year IN (${yearParams.join(',')})`);
     }
// Xử lý filter ngôn ngữ
if (req.query.languages && req.query.languages.length > 0) {
  const languages = req.query.languages.split(',');
  const langParams = languages.map((lang, i) => {
    const paramName = `lang${i}`;
    request.input(paramName, sql.NVarChar, lang);
    return `@${paramName}`; 
  });
 
  conditions.push(`m.Language IN (${langParams.join(',')})`);
 }
     const query = `
       SELECT 
           m.MovieID, m.Name, m.OriginName, m.Slug, 
           m.Type, m.Status, m.ThumbUrl, m.PosterUrl,
           m.BannerUrl, m.TrailerUrl, m.Episode_Current,
           m.Episode_Total, m.Quality, m.Language as Lang,
           m.Views, m.Year,
           (SELECT STRING_AGG(c.Name, ', ') 
            FROM Categories c
            INNER JOIN MovieCategories mc ON c.CategoryID = mc.CategoryID
            WHERE mc.MovieID = m.MovieID) as Categories,
           (SELECT STRING_AGG(c.Name, ', ')
            FROM Countries c
            INNER JOIN MovieCountries mc ON c.CountryID = mc.CountryID 
            WHERE mc.MovieID = m.MovieID) as Countries,
           COUNT(*) OVER() as TotalCount
       FROM Movies m
       WHERE ${conditions.join(' AND ')}
       ORDER BY m.CreatedAt DESC
       OFFSET @offset ROWS 
       FETCH NEXT @limit ROWS ONLY
     `;

     const result = await request.query(query);

     res.json({
       success: true,
       data: result.recordset,
       pagination: {
         page,
         limit,
         totalItems: result.recordset[0]?.TotalCount || 0,
         totalPages: Math.ceil((result.recordset[0]?.TotalCount || 0) / limit)
       }
     });

   } catch (error) {
     console.error('Filter movies error:', error);
     res.status(500).json({
       success: false,
       message: error.message
     });
   } finally {
     if (pool) {
       try {
         await pool.close();
       } catch (err) {
         console.error('Error closing pool:', err);
       }
     }
   }
}

module.exports = {filterMovies};