// controllers/movieDetail.controller.js
const sql = require("mssql");
const db = require("../../database/database");

// controllers/movieDetail.controller.js
async function getMovieBySlug(req, res) {
  let pool;
  try {
    const { slug } = req.params;
    pool = await db.getConnection();

    // Lấy thông tin phim
    const movieResult = await pool.request().input("slug", sql.NVarChar, slug)
      .query(`
                SELECT 
                    m.*,
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
                WHERE m.Slug = @slug AND m.IsVisible = 1
            `);

    if (!movieResult.recordset[0]) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    const movie = movieResult.recordset[0];

    // Lấy episodes đã được gom nhóm theo server
    const episodesResult = await pool
      .request()
      .input("movieId", sql.Int, movie.MovieID).query(`
                SELECT 
                    s.ServerID,
                    s.Name as ServerName,
                    s.Type as ServerType,
                    (
                        SELECT e.EpisodeID, e.Name, e.Slug, e.FileName,e.EpisodeNumber, e.Duration,
                        e.VideoUrl, e.EmbedUrl
                        FROM Episodes e
                        WHERE e.MovieID = @movieId 
                        AND e.ServerID = s.ServerID
                        ORDER BY e.EpisodeNumber
                        FOR JSON PATH
                    ) as Episodes
                FROM Servers s
                WHERE EXISTS (
                    SELECT 1 FROM Episodes e 
                    WHERE e.ServerID = s.ServerID 
                    AND e.MovieID = @movieId
                )
                ORDER BY s.Priority DESC
            `);

    // Format response với episodes được gom theo server
    const serverEpisodes = episodesResult.recordset.map((server) => ({
      serverID: server.ServerID,
      serverName: server.ServerName,
      serverType: server.ServerType,
      episodes: JSON.parse(server.Episodes),
    }));

    res.json({
      success: true,
      data: {
        ...movie,
        servers: serverEpisodes,
      },
    });
  } catch (error) {
    console.error("Error getting movie details:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function checkStatus(req, res) {
  try {
    const movieId = parseInt(req.params.movieId);
    const userId = req.user.id;

    const pool = await db.getConnection();
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("movieId", sql.Int, movieId).query(`
            SELECT 
              (SELECT COUNT(*) FROM WatchLater WHERE UserID = @userId AND MovieID = @movieId) as inWatchLater,
              (SELECT COUNT(*) FROM MovieRatings WHERE UserID = @userId AND MovieID = @movieId AND RatingType = 'like') as isLiked
          `);

    res.json({
      inWatchLater: result.recordset[0].inWatchLater > 0,
      isLiked: result.recordset[0].isLiked > 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getMovieBySlug,
  checkStatus,
};
