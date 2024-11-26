const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const config = require('../database/config');
const categoryController = require('./controllers/category.controller');
const countryController = require('./controllers/country.controller');
const movieController = require('./controllers/movie.controller');
const cleanMovieController = require('./controllers/cleanMovieController');
const parallelMovieController = require('./controllers/parallelMovieSync');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;


async function connectDatabase() {
  try {
    await sql.connect(config);
    console.log('Connected to SQL Server');
    
    // Test query kiểm tra các bảng hiện có
    const result = await sql.query`
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
    ORDER BY TableName;`;

    console.table(result.recordset.map(item => ({
      'Table Name': item.TableName,
      'Record Count': item.RecordCount
    })));
    
  } catch (err) {
    console.error('SQL Server connection error:', err);
  }
}

connectDatabase();




// Category routes
app.post('/api/categories/sync', categoryController.syncCategories);

app.get('/api/categories', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .query('SELECT * FROM Categories ORDER BY DisplayOrder, Name');
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Categories WHERE CategoryId = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Country routes 
app.post('/api/countries/sync', countryController.syncCountries);
app.get('/api/countries', countryController.getCountries);
app.get('/api/countries/:id', countryController.getCountryById);

// Movie routes
app.post('/api/movies/sync/:slug', movieController.syncMovieBySlug);
// Route để sync nhiều phim
app.post('/api/movies/sync-all', movieController.syncAllMovies);

// Route để xóa toàn bộ dữ liệu phim
app.post('/api/movies/clean-all', cleanMovieController.cleanAllMovieData);

// Thêm route trong index.js
app.post('/api/movies/parallel-sync', parallelMovieController.startParallelSync);



// Thêm route để lấy danh sách phim
app.get('/api/movies', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .query(`
        SELECT m.*,
          STRING_AGG(c.Name, ', ') WITHIN GROUP (ORDER BY c.Name) as Categories,
          STRING_AGG(co.Name, ', ') WITHIN GROUP (ORDER BY co.Name) as Countries
        FROM Movies m
        LEFT JOIN MovieCategories mc ON m.MovieID = mc.MovieID
        LEFT JOIN Categories c ON mc.CategoryID = c.CategoryID
        LEFT JOIN MovieCountries mco ON m.MovieID = mco.MovieID
        LEFT JOIN Countries co ON mco.CountryID = co.CountryID
        GROUP BY m.MovieID, m.Name, m.OriginName, m.Slug, m.Description,
          m.Content, m.Type, m.Status, m.ThumbUrl, m.PosterUrl, m.TrailerUrl,
          m.Duration, m.Episode_Current, m.Episode_Total, m.Quality,
          m.Language, m.Year, m.Actors, m.Directors, m.IsCopyright,
          m.IsSubtitled, m.IsPremium, m.IsVisible, m.Views,
          m.ViewsDay, m.ViewsWeek, m.ViewsMonth, m.Rating_Value,
          m.Rating_Count, m.CreatedAt, m.UpdatedAt, m.PublishedAt,
          m.TmdbId, m.ImdbId, m.TmdbRating, m.TmdbVoteCount
        ORDER BY m.CreatedAt DESC
      `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Route để lấy chi tiết phim theo slug
app.get('/api/movies/:slug', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('slug', sql.NVarChar(255), req.params.slug)
      .query(`
        SELECT *
        FROM Movies m
        LEFT JOIN MovieCategories mc ON m.MovieID = mc.MovieID
        LEFT JOIN Categories c ON mc.CategoryID = c.CategoryID
        LEFT JOIN MovieCountries mco ON m.MovieID = mco.MovieID
        LEFT JOIN Countries co ON mco.CountryID = co.CountryID
        WHERE m.Slug = @slug
        
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    const movie = result.recordset[0];
    if (movie.Servers) {
      movie.Servers = JSON.parse(movie.Servers);
    }

    res.json({
      success: true,
      data: movie
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});