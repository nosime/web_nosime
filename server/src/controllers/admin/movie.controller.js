
const sql = require("mssql");
async function adminGetMovies(req, res) {
    let pool;
    try {
      pool = await db.getConnection();
      
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;
  
      // Lấy tổng số phim
      const totalResult = await pool.request()
        .query('SELECT COUNT(*) as total FROM Movies');
      const total = totalResult.recordset[0].total;
  
      // Lấy danh sách phim có phân trang
      const query = `
        SELECT 
          m.MovieID,
          m.Title,
          m.OriginalTitle,
          m.Slug,
          m.Thumb,
          m.Poster,
          m.Year,
          m.Status,
          m.Type,
          STRING_AGG(g.Name, ', ') as Genres
        FROM Movies m
        LEFT JOIN MovieGenres mg ON m.MovieID = mg.MovieID
        LEFT JOIN Genres g ON mg.GenreID = g.GenreID
        GROUP BY 
          m.MovieID, m.Title, m.OriginalTitle, 
          m.Slug, m.Thumb, m.Poster, 
          m.Year, m.Status, m.Type
        ORDER BY m.MovieID DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;
  
      const result = await pool.request()
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, limit)
        .query(query);
  
      res.json({
        success: true,
        data: result.recordset,
        total: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      });
  
    } catch (error) {
      console.error('Error in adminGetMovies:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách phim'
      });
    } finally {
      if (pool) {
        pool.close();
      }
    }
  }
  

  async function adminDeleteMovie(req, res) {
    const { id } = req.params;
    let pool;
    
    try {
        // Lấy connection
        pool = await db.getConnection();
        
        // Bắt đầu transaction
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        
        try {
            // 1. Xóa lịch sử xem
            await transaction.request()
                .input('movieId', sql.Int, id)
                .query(`DELETE FROM ViewHistory 
                        WHERE EpisodeID IN (SELECT EpisodeID FROM Episodes WHERE MovieID = @movieId)`);

            // 2. Xóa các tập phim
            await transaction.request()
                .input('movieId', sql.Int, id) 
                .query('DELETE FROM Episodes WHERE MovieID = @movieId');

            // 3. Xóa danh sách xem sau 
            await transaction.request()
                .input('movieId', sql.Int, id)
                .query('DELETE FROM WatchLater WHERE MovieID = @movieId');

            // 4. Xóa danh sách yêu thích
            await transaction.request()
                .input('movieId', sql.Int, id)
                .query('DELETE FROM MovieRatings WHERE MovieID = @movieId');

            // 5. Xóa liên kết với Categories
            await transaction.request()
                .input('movieId', sql.Int, id)
                .query('DELETE FROM MovieCategories WHERE MovieID = @movieId');

            // 6. Xóa liên kết với Countries  
            await transaction.request()
                .input('movieId', sql.Int, id)
                .query('DELETE FROM MovieCountries WHERE MovieID = @movieId');

            // 7. Cuối cùng xóa phim
            await transaction.request()
                .input('movieId', sql.Int, id)
                .query('DELETE FROM Movies WHERE MovieID = @movieId');

            // Commit transaction
            await transaction.commit();

            res.json({
                success: true,
                message: 'Xóa phim thành công'
            });

        } catch (err) {
            // Rollback nếu có lỗi
            await transaction.rollback();
            throw err;
        }

    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi xóa phim'
        });
    }
}
  
  module.exports = {
    // ... các export hiện có ...
    adminGetMovies,
    adminDeleteMovie
  };