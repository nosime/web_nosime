// watchLater.controller.js
const sql = require('mssql');
const db = require('../../../database/database');

class WatchLaterController {
  async toggleWatchLater(req, res) {
    let pool;
    try {
      const { movieId } = req.body;
      const userId = req.user.id; // Từ JWT middleware

      pool = await db.getConnection();
      
      // Check if movie exists in watch later
      const checkResult = await pool.request()
        .input('userId', sql.Int, userId)
        .input('movieId', sql.Int, movieId)
        .query('SELECT WatchLaterID FROM WatchLater WHERE UserID = @userId AND MovieID = @movieId');

      if (checkResult.recordset.length > 0) {
        // Remove from watch later
        await pool.request()
          .input('userId', sql.Int, userId)
          .input('movieId', sql.Int, movieId)
          .query('DELETE FROM WatchLater WHERE UserID = @userId AND MovieID = @movieId');

        res.json({ success: true, added: false });
      } else {
        // Add to watch later
        await pool.request()
          .input('userId', sql.Int, userId)
          .input('movieId', sql.Int, movieId)
          .query(`
            INSERT INTO WatchLater (UserID, MovieID, AddedDate)
            VALUES (@userId, @movieId, GETDATE())
          `);

        res.json({ success: true, added: true });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  async getWatchLater(req, res) {
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
                    w.Notes,
                    w.AddedDate,
                    w.Priority,
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
                INNER JOIN WatchLater w ON m.MovieID = w.MovieID
                WHERE w.UserID = @userId
                AND m.IsVisible = 1
                ORDER BY w.Priority DESC, w.AddedDate DESC
            `);

        res.json({
            success: true,
            data: result.recordset
        });

    } catch (error) {
        console.error('Error in getWatchLater:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách xem sau'
        });
    }
}


}

module.exports = {
  WatchLaterController: new WatchLaterController()
};