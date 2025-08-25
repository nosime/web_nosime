const db = require('../../../database/database');
const sql = require('mssql');

class UserController {
  // Lấy danh sách người dùng có phân trang
  async getUsers(req, res) {
    try {
      const page = parseInt(req.query.page ) || 1;
      const limit = parseInt(req.query.limit ) || 24;
      const offset = (page - 1) * limit;

      const queryCount = 'SELECT COUNT(*) as total FROM Users';
      const queryUsers = `
        SELECT 
          u.UserID,
          u.Username,
          u.Email,
          u.DisplayName,
          u.IsActive,
          u.IsVerified,
          u.CreatedAt,
          r.Name as RoleName
        FROM Users u
        LEFT JOIN UserRoles ur ON u.UserID = ur.UserID
        LEFT JOIN Roles r ON ur.RoleID = r.RoleID
        ORDER BY u.CreatedAt DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      // Lấy kết nối từ pool
      const pool = await db.getConnection();

      // Lấy tổng số lượng người dùng
      const countResult = await pool.request().query(queryCount);
      const totalItems = countResult.recordset[0].total;

      // Lấy danh sách người dùng
      const usersResult = await pool
        .request()
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, limit)
        .query(queryUsers);

      // Tính tổng số trang
      const totalPages = Math.ceil(totalItems / limit);

      // Gửi dữ liệu về client
      return res.json({
        success: true,
        data: usersResult.recordset,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
        },
      });
    } catch (error) {
      console.error('Error getting user list:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ, không thể lấy danh sách người dùng',
      });
    }
  }

  // Xóa người dùng

async deleteUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
  
      // Kiểm tra nếu ID không hợp lệ
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'ID người dùng không hợp lệ',
        });
      }
  
      const pool = await db.getConnection();
  
      // Kiểm tra người dùng có tồn tại hay không
      const userCheckResult = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query('SELECT u.UserID, r.Name AS RoleName FROM Users u LEFT JOIN UserRoles ur ON u.UserID = ur.UserID LEFT JOIN Roles r ON ur.RoleID = r.RoleID WHERE u.UserID = @userId');
  
      if (userCheckResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại',
        });
      }
  
      // Kiểm tra vai trò của người dùng
      const roleName = userCheckResult.recordset[0].RoleName;
  
      if (roleName === 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'Không thể xóa người dùng có vai trò Admin',
        });
      }
  
      // Xóa người dùng
      await pool
        .request()
        .input('userId', sql.Int, userId)
        .query('DELETE FROM Users WHERE UserID = @userId');
  
      return res.json({
        success: true,
        message: 'Người dùng đã được xóa thành công',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ, không thể xóa người dùng',
      });
    }
  }
  
}

module.exports = new UserController();
