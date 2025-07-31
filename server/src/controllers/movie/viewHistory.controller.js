
const db = require('../../../database/database');

class ViewHistoryController {

  // Lưu lịch sử xem
  async saveViewHistory(req, res) {
    try {
      const { userId, movieId, episodeId, serverId } = req.body;

      // Validate input
      if (!userId || !movieId || !episodeId || !serverId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin cần thiết'
        });
      }

      // Check record exists
      const existingRecord = await db.query(`
        SELECT HistoryID FROM ViewHistory 
        WHERE UserID = @userId 
        AND MovieID = @movieId
        AND EpisodeID = @episodeId
      `, { userId, movieId, episodeId });

      if (existingRecord.recordset.length > 0) {
        // Update existing record
        await db.query(`
          UPDATE ViewHistory SET
            ViewDate = GETDATE(),
            ServerID = @serverId
          WHERE HistoryID = @historyId
        `, {
          historyId: existingRecord.recordset[0].HistoryID,
          serverId
        });

        return res.json({
          success: true,
          message: 'Đã cập nhật lịch sử xem'
        });

      } else {
        // Create new record
        const result = await db.query(`
          INSERT INTO ViewHistory (
            UserID, MovieID, EpisodeID, ServerID, ViewDate
          ) VALUES (
            @userId, @movieId, @episodeId, @serverId, GETDATE()
          );
          SELECT SCOPE_IDENTITY() as HistoryID;
        `, {
          userId, movieId, episodeId, serverId
        });

        return res.json({
          success: true,
          message: 'Đã thêm lịch sử xem mới',
          data: {
            historyId: result.recordset[0].HistoryID
          }
        });
      }

    } catch (error) {
      console.error('Lỗi khi lưu lịch sử:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server'
      });
    }
  }

  async getUserHistory(req, res) {
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
  
      const result = await db.query(`
        SELECT 
          vh.HistoryID,
          vh.UserID,
          vh.MovieID,
          vh.EpisodeID,
          vh.ServerID,
          vh.ViewDate,
          u.Username,
          m.Name AS MovieName,
          m.Slug AS MovieSlug,
          m.ThumbUrl AS MovieThumb,
          m.PosterUrl AS MoviePoster,
          e.Name AS EpisodeName,
          e.Slug AS EpisodeSlug,
          e.FileName AS EpisodeFileName,
          e.EpisodeNumber,
          s.Name AS ServerName
        FROM ViewHistory vh
        JOIN Users u ON vh.UserID = u.UserID
        JOIN Movies m ON vh.MovieID = m.MovieID
        JOIN Episodes e ON vh.EpisodeID = e.EpisodeID 
        JOIN Servers s ON vh.ServerID = s.ServerID
        WHERE vh.UserID = @userId
        ORDER BY vh.ViewDate DESC
      `, { userId });
  
      // Format lại dữ liệu trả về
      const formattedData = result.recordset.map(record => ({
        historyId: record.HistoryID,
        user: {
          userId: record.UserID,
          username: record.Username
        },
        movie: {
          movieId: record.MovieID,
          name: record.MovieName,
          slug: record.MovieSlug,  // Thêm slug của phim
          thumbUrl: record.MovieThumb,
          posterUrl: record.MoviePoster
        },
        episode: {
          episodeId: record.EpisodeID,
          name: record.EpisodeName,
          slug: record.EpisodeSlug, // Thêm slug của tập
          fileName: record.EpisodeFileName, // Thêm filename của tập
          episodeNumber: record.EpisodeNumber
        },
        server: {
          serverId: record.ServerID,
          name: record.ServerName
        },
        viewDate: record.ViewDate
      }));
  
      res.json({
        success: true,
        data: formattedData 
      });
  
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử xem:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server'
      });
    }
  }
}

module.exports = new ViewHistoryController();