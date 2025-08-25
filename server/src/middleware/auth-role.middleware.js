// middleware/auth-role.middleware.js
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('../config/jwt.config');
const db = require('../../database/database');

// Middleware kiểm tra role và permissions
const checkPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Giải mã token
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const userId = decoded.id;

      // Lấy thông tin quyền của user
      const pool = await db.getConnection();
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT DISTINCT p.Code
          FROM Users u
          JOIN UserRoles ur ON u.UserID = ur.UserID
          JOIN RolePermissions rp ON ur.RoleID = rp.RoleID
          JOIN Permissions p ON rp.PermissionID = p.PermissionID
          WHERE u.UserID = @userId AND u.IsActive = 1
        `);

      const userPermissions = result.recordset.map(r => r.Code);

      // Kiểm tra quyền
      const hasPermission = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
      }

      // Lưu permissions vào request để sử dụng sau
      req.userPermissions = userPermissions;
      next();

    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

module.exports = { checkPermission };