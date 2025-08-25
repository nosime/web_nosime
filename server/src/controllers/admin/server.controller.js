// controllers/admin/server.controller.js
const db = require('../../../database/database');

class ServerController {
  // Lấy danh sách server
  async getServers(req, res) {
    try {
      const result = await db.query(`
        SELECT * FROM Servers 
        ORDER BY Priority DESC, CreatedAt DESC
      `);

      res.json({
        success: true,
        data: result.recordset
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Thêm server mới
  async addServer(req, res) {
    try {
      const { Name, Type, Priority, IsActive } = req.body;

      const result = await db.query(`
        INSERT INTO Servers (Name, Type, Priority, IsActive)
        VALUES (@Name, @Type, @Priority, @IsActive);
        SELECT SCOPE_IDENTITY() as ServerId;
      `, {
        Name: Name,
        Type: Type,
        Priority: Priority || 0,
        IsActive: IsActive === undefined ? true : IsActive
      });

      res.json({
        success: true,
        message: 'Thêm server thành công',
        data: {
          ServerId: result.recordset[0].ServerId
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Cập nhật server
  async updateServer(req, res) {
    try {
      const { id } = req.params;
      const { Name, Type, Priority, IsActive } = req.body;

      await db.query(`
        UPDATE Servers
        SET Name = @Name,
            Type = @Type,
            Priority = @Priority,
            IsActive = @IsActive
        WHERE ServerID = @ServerID
      `, {
        ServerID: id,
        Name: Name,
        Type: Type,
        Priority: Priority,
        IsActive: IsActive
      });

      res.json({
        success: true,
        message: 'Cập nhật server thành công'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Xóa server
  async deleteServer(req, res) {
    try {
      const { id } = req.params;

      await db.query(`
        DELETE FROM Servers 
        WHERE ServerID = @ServerID
      `, {
        ServerID: id
      });

      res.json({
        success: true,
        message: 'Xóa server thành công'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ServerController();