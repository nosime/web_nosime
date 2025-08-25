const sql = require("mssql");
const db = require("../../../database/database");

// Controller lấy danh sách top phim xem nhiều( limitdefault=10)
async function getTopViewMovies(req, res) {
  let pool;
  const BATCH_SIZE = 10;
  try {
    // Lấy connection từ pool
    pool = await db.getConnection();

    const limit = parseInt(req.params.limit) || BATCH_SIZE;

    const result = await pool.request().input("limit", sql.Int, limit).query(`
                WITH MovieRanks AS (
                    SELECT 
                        m.*,
                        (SELECT STRING_AGG(c.Name, ', ')
                         FROM Categories c
                         INNER JOIN MovieCategories mc ON c.CategoryID = mc.CategoryID
                         WHERE mc.MovieID = m.MovieID) as Categories,
                        (SELECT STRING_AGG(co.Name, ', ')
                         FROM Countries co
                         INNER JOIN MovieCountries mco ON co.CountryID = mco.CountryID
                         WHERE mco.MovieID = m.MovieID) as Countries,
                        RANK() OVER (ORDER BY m.Views DESC) as MovieRank
                    FROM Movies m
                    WHERE m.IsVisible = 1
                )
                SELECT 
                    MovieRank as Rank,
                    MovieID,
                    Name,
                    OriginName,
                    Slug,
                    Type,
                    Status,
                    ThumbUrl,
                    PosterUrl,
                    BannerUrl,
                    TrailerUrl,
                    Episode_Current,
                    Episode_Total,
                    Quality,
                    Language as Lang,
                    Views,
                    Year,
                    Categories,
                    Countries
                FROM MovieRanks
                WHERE MovieRank <= @limit
                ORDER BY MovieRank ASC
            `);

    res.json({
      success: true,
      data: result.recordset,
      total: result.recordset.length,
    });
  } catch (error) {
    console.error("Lỗi server khi lấy danh sách top phim:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách top phim",
      error: error.message,
    });
  }
}

module.exports = {
  getTopViewMovies,
};
