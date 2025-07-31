const sql = require("mssql");
const db = require("../../../database/database");
// Controller lấy danh sách phim phân trang (pagedefaut=1, limitdefault=24)
async function getMoviesListPaginatedLimit(req, res) {
  let pool;
  try {
    // Lấy connection từ pool
    pool = await db.getConnection();

    const page = parseInt(req.params.page) || 1;
    const limitItems = parseInt(req.params.limit) || 24;
    const offset = (page - 1) * limitItems;

    // Query đếm tổng số phim
    const countResult = await pool
      .request()
      .query("SELECT COUNT(*) as total FROM Movies WHERE IsVisible = 1");

    const totalMovies = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalMovies / limitItems);

    // Query chính để lấy danh sách phim
    const result = await pool
      .request()
      .input("offset", sql.Int, offset)
      .input("limitItems", sql.Int, limitItems).query(`
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
                    WHERE m.IsVisible = 1
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
        totalPages,
      },
    });
  } catch (error) {
    console.error("Lỗi server khi lấy danh sách phim page:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách phim page",
      error: error.message,
    });
  }
}

module.exports = {
  getMoviesListPaginatedLimit,
};
