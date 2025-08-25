// edit-movie.controller.js
const sql = require('mssql');
const db = require('../../../database/database');

class EditMovieController {
  async updateMovie(req, res) {
    let pool;
    try {
      const movieId = req.params.id;
      const movieData = req.body;

      pool = await db.getConnection();
      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        // 1. Cập nhật thông tin phim
        await transaction.request()
          .input('MovieID', sql.Int, movieId)
          .input('Name', sql.NVarChar, movieData.Name)
          .input('OriginName', sql.NVarChar, movieData.OriginName)
          .input('Description', sql.NVarChar(sql.MAX), movieData.Description)
          .input('Type', sql.VarChar(20), movieData.Type)
          .input('Status', sql.VarChar(20), movieData.Status)
          .input('ThumbUrl', sql.NVarChar(500), movieData.ThumbUrl)
          .input('PosterUrl', sql.NVarChar(500), movieData.PosterUrl)
          .input('TrailerUrl', sql.NVarChar(500), movieData.TrailerUrl)
          .input('Year', sql.Int, movieData.Year)
          .input('Language', sql.NVarChar(50), movieData.Language)
          .input('Quality', sql.VarChar(20), movieData.Quality)
          .input('Actors', sql.NVarChar(sql.MAX), movieData.Actors)
          .input('Directors', sql.NVarChar(sql.MAX), movieData.Directors)
          .query(`
            UPDATE Movies SET
              Name = @Name,
              OriginName = @OriginName,
              Description = @Description,
              Type = @Type,
              Status = @Status,
              ThumbUrl = @ThumbUrl,
              PosterUrl = @PosterUrl,
              TrailerUrl = @TrailerUrl,
              Year = @Year,
              Language = @Language,
              Quality = @Quality,
              Actors = @Actors,
              Directors = @Directors,
              UpdatedAt = GETDATE()
            WHERE MovieID = @MovieID
          `);

        // 2. Cập nhật categories
        await transaction.request()
          .input('MovieID', sql.Int, movieId)
          .query('DELETE FROM MovieCategories WHERE MovieID = @MovieID');

        for (const categorySlug of movieData.Categories) {
          const categoryResult = await transaction.request()
            .input('Slug', sql.NVarChar, categorySlug)
            .query('SELECT CategoryID FROM Categories WHERE Slug = @Slug');

          if (categoryResult.recordset.length > 0) {
            await transaction.request()
              .input('MovieID', sql.Int, movieId)
              .input('CategoryID', sql.Int, categoryResult.recordset[0].CategoryID)
              .query('INSERT INTO MovieCategories (MovieID, CategoryID) VALUES (@MovieID, @CategoryID)');
          }
        }

        // 3. Cập nhật country 
        await transaction.request()
          .input('MovieID', sql.Int, movieId)
          .query('DELETE FROM MovieCountries WHERE MovieID = @MovieID');

        const countrySlug = movieData.Countries[0];
        const countryResult = await transaction.request()
          .input('Slug', sql.NVarChar, countrySlug)
          .query('SELECT CountryID FROM Countries WHERE Slug = @Slug');

        if (countryResult.recordset.length > 0) {
          await transaction.request()
            .input('MovieID', sql.Int, movieId)
            .input('CountryID', sql.Int, countryResult.recordset[0].CountryID)
            .query('INSERT INTO MovieCountries (MovieID, CountryID) VALUES (@MovieID, @CountryID)');
        }

        await transaction.commit();

        res.json({
          success: true,
          message: 'Cập nhật phim thành công'
        });

      } catch (err) {
        await transaction.rollback();
        throw err;
      }

    } catch (error) {
      console.error('Error in updateMovie:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Có lỗi xảy ra khi cập nhật phim'
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
}

module.exports = new EditMovieController();