const sql = require('mssql');
const db = require('../../../database/database');

class EpisodeController {
  // Lấy danh sách tập phim của một bộ phim
  async getEpisodes(req, res) {
    const { movieId } = req.params;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID is required',
      });
    }

    try {
        const result = await db.query(`
            SELECT E.*, S.Name as ServerName
            FROM Episodes E
            LEFT JOIN Servers S ON E.ServerID = S.ServerID
            WHERE E.MovieID = @movieId
            ORDER BY E.EpisodeNumber ASC
          `, { movieId });
          

      res.json({
        success: true,
        data: result.recordset,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
 
// Sửa lại hàm addEpisode
async addEpisode(req, res) {
  const {
    Name, Slug, FileName, EpisodeNumber,
    EmbedUrl, ServerID, MovieID,
  } = req.body;

  if (!MovieID || !Name || !Slug || !EpisodeNumber) {
    return res.status(400).json({
      success: false,
      message: 'Movie ID, Name, Slug, and Episode Number are required',
    });
  }

  try {
    // Thêm tập phim mới
    const result = await db.query(
      `INSERT INTO Episodes 
      (MovieID, ServerID, Name, Slug, FileName, EpisodeNumber, EmbedUrl, CreatedAt) 
      VALUES 
      (@MovieID, @ServerID, @Name, @Slug, @FileName, @EpisodeNumber, @EmbedUrl, GETDATE());
      SELECT SCOPE_IDENTITY() AS EpisodeID;`,
      { MovieID, ServerID, Name, Slug, FileName, EpisodeNumber, EmbedUrl }
    );

    // Cập nhật số tập hiện tại
    await updateEpisodeCount(MovieID);

    res.status(201).json({
      success: true,
      data: { episodeId: result.recordset[0].EpisodeID },
      message: 'Episode added successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false, 
      message: error.message,
    });
  }
}
  

  // Sửa thông tin tập phim
  async updateEpisode(req, res) {
    const { id } = req.params;
    const {
        Name,
        Slug,
        FileName,
        EpisodeNumber,
      EmbedUrl,
      ServerID,
      MovieID,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Episode ID is required',
      });
    }

    try {
      await db.query(
        `UPDATE Episodes
        SET MovieID= @MovieID,ServerID=@ServerID,Name = @Name, Slug = @Slug, FileName = @FileName, EpisodeNumber = @EpisodeNumber,EmbedUrl = @EmbedUrl, UpdatedAt = GETDATE()
        WHERE EpisodeID = @id`,
        { MovieID, ServerID, Name, Slug, FileName, EpisodeNumber, EmbedUrl, id }
      );

      res.json({
        success: true,
        message: 'Episode updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Xóa tập phim
  async deleteEpisode(req, res) {
    const { id } = req.params;
  
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Episode ID is required',
      });
    }
  
    try {
      // Lấy MovieID của tập phim
      const episodeResult = await db.query(
        `SELECT MovieID FROM Episodes WHERE EpisodeID = @id`,
        { id }
      );
      
      if (episodeResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Episode not found',
        });
      }
      
      const movieId = episodeResult.recordset[0].MovieID;
  
      // Xóa các bản ghi liên quan trong ViewHistory
      await db.query(
        `DELETE FROM ViewHistory WHERE EpisodeID = @id`,
        { id }
      );
  
      // Xóa tập phim
      await db.query(
        `DELETE FROM Episodes WHERE EpisodeID = @id`,
        { id }
      );
  
      // Cập nhật số tập hiện tại
      await updateEpisodeCount(movieId);
  
      res.json({
        success: true,
        message: 'Episode deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

}
async function updateEpisodeCount(movieId) {
  try {
    // Đếm tổng số tập của phim
    const result = await db.query(
      `SELECT COUNT(*) as totalEpisodes 
       FROM Episodes 
       WHERE MovieID = @movieId`,
      { movieId }
    );

    const totalEpisodes = result.recordset[0].totalEpisodes;

    // Cập nhật Episode_Current trong bảng Movies
    await db.query(
      `UPDATE Movies 
       SET Episode_Current = @totalEpisodes
       WHERE MovieID = @movieId`,
      { movieId, totalEpisodes }
    );
  } catch (error) {
    console.error('Error updating episode count:', error);
    throw error;
  }
}
module.exports = new EpisodeController();
