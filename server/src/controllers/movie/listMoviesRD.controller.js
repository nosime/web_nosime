const sql = require("mssql");
const db = require("../../../database/database");

// Controller lấy danh sách phim random phân trang (pagedefaut=1, limitdefault=24)

async function getMoviesListPaginatedRandom(req, res) {
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

    // Query lấy phim random
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
          ORDER BY NEWID() -- Thêm ORDER BY NEWID() để random
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
    console.error("Lỗi server khi lấy danh sách phim random page:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách phim random page",
      error: error.message,
    });
  }
}

// Controller lấy danh sách phim random( limitdefault=24)
// controllers/listMoviesRD.controller.js
async function getRandomMovies(req, res) {
  let pool;
  const BATCH_SIZE = 10;

  try {
    pool = await db.getConnection();
    const limit = parseInt(req.params.limit) || BATCH_SIZE;

    const result = await pool.request().input("limit", sql.Int, limit).query(`
              WITH MovieIds AS (
                  SELECT TOP (@limit) MovieID 
                  FROM Movies
                  WHERE IsVisible = 1
                  ORDER BY NEWID()
              )
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
                      JOIN MovieCategories mc ON c.CategoryID = mc.CategoryID
                      WHERE mc.MovieID = m.MovieID
                  ) as Categories,
                  (
                      SELECT STRING_AGG(co.Name, ', ')
                      FROM Countries co
                      JOIN MovieCountries mco ON co.CountryID = mco.CountryID
                      WHERE mco.MovieID = m.MovieID
                  ) as Countries
              FROM Movies m
              INNER JOIN MovieIds i ON m.MovieID = i.MovieID
          `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error("Lỗi server khi lấy danh sách phim random:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách phim random",
      error: error.message,
    });
  }
}
module.exports = {
  getRandomMovies,
  getMoviesListPaginatedRandom,
};
