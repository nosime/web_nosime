
const sql = require('mssql');
const db = require('../../../database/database');


class MovieRatingController {
    async toggleLike(req, res) {
      let pool;
      try {
        const { movieId } = req.body;
        const userId = req.user.id;
  
        pool = await db.getConnection();
        
        // Check existing rating
        const checkResult = await pool.request()
          .input('userId', sql.Int, userId)
          .input('movieId', sql.Int, movieId)
          .query('SELECT RatingID, RatingType FROM MovieRatings WHERE UserID = @userId AND MovieID = @movieId');
  
        const exists = checkResult.recordset[0];
        const isCurrentlyLiked = exists && exists.RatingType === 'like';
  
        if (isCurrentlyLiked) {
          // Remove like
          await pool.request()
            .input('ratingId', sql.Int, exists.RatingID)
            .query('DELETE FROM MovieRatings WHERE RatingID = @ratingId');
  
          res.json({ success: true, liked: false });
        } else {
          // Add/Update like
          if (exists) {
            await pool.request()
              .input('ratingId', sql.Int, exists.RatingID)
              .query(`
                UPDATE MovieRatings 
                SET RatingType = 'like',
                    UpdatedAt = GETDATE()
                WHERE RatingID = @ratingId
              `);
          } else {
            await pool.request()
              .input('userId', sql.Int, userId)
              .input('movieId', sql.Int, movieId)
              .query(`
                INSERT INTO MovieRatings (UserID, MovieID, RatingType, CreatedAt)
                VALUES (@userId, @movieId, 'like', GETDATE())
              `);
          }
  
          res.json({ success: true, liked: true });
        }
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    }
    async getFavorites(req, res) {
      let pool;
      try {
        let userId;

        if (req.user.role === 'Admin' && req.params.userId) {
          userId = parseInt(req.params.userId);
          if (isNaN(userId)) {
            userId = req.user.id;
          }
        } else {
          userId = req.user.id;
        }
          pool = await db.getConnection();

          const result = await pool.request()
              .input('userId', sql.Int, userId)
              .query(`
                  SELECT 
                      m.*,
                      mr.CreatedAt as FavoriteDate,
                      mr.RatingType,
                      (
                          SELECT STRING_AGG(c.Name, ', ')
                          FROM Categories c
                          INNER JOIN MovieCategories mc ON c.CategoryID = mc.CategoryID
                          WHERE mc.MovieID = m.MovieID
                      ) as Categories,
                      (
                          SELECT STRING_AGG(co.Name, ', ')
                          FROM Countries co
                          INNER JOIN MovieCountries mco ON co.CountryID = mco.CountryID
                          WHERE mco.MovieID = m.MovieID
                      ) as Countries
                  FROM Movies m
                  INNER JOIN MovieRatings mr ON m.MovieID = mr.MovieID
                  WHERE mr.UserID = @userId 
                  AND mr.RatingType = 'like'
                  AND m.IsVisible = 1
                  ORDER BY mr.CreatedAt DESC
              `);

          res.json({
              success: true,
              data: result.recordset
          });

      } catch (error) {
          console.error('Error in getFavorites:', error);
          res.status(500).json({
              success: false,
              message: 'Lỗi server khi lấy danh sách yêu thích'
          });
      }
  }
  }
  
  module.exports = {
   MovieRatingController: new MovieRatingController()
  };