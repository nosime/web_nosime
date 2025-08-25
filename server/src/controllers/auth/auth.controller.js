// server/src/controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sql = require("mssql");
const db = require('../../../database/database');

const { JWT_SECRET, JWT_EXPIRES } = require("../../config/jwt.config");

class AuthController {
  // Login controller
  async login(req, res) {
    let pool;
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ thông tin",
        });
      }

      // Kết nối database
      pool = await db.getConnection();

      // Check user exists
      const result = await pool
        .request()
        .input("username", sql.NVarChar, username).query(`
          SELECT u.*, r.Name as RoleName 
          FROM Users u
          LEFT JOIN UserRoles ur ON u.UserID = ur.UserID
          LEFT JOIN Roles r ON ur.RoleID = r.RoleID
          WHERE u.Username = @username
        `);

      if (result.recordset.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Tài khoản hoặc mật khẩu không đúng",
        });
      }

      const user = result.recordset[0];

      // Verify password
      const validPassword = await bcrypt.compare(password, user.Password);
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: "Tài khoản hoặc mật khẩu không đúng",
        });
      }

      // Check account status
      if (!user.IsActive) {
        return res.status(401).json({
          success: false,
          message: "Tài khoản đã bị khóa",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.UserID, role: user.RoleName },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
      );

      // Remove sensitive data
      delete user.Password;
      delete user.ResetToken;
      delete user.ResetTokenExpires;

      res.json({
        success: true,
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server, vui lòng thử lại sau",
      });
    } finally {
      if (pool) {
        await pool.close();
      }
    }
  }

  // Register controller (giữ nguyên không thay đổi)
  async register(req, res) {
    let pool;
    try {
      const { username, email, password, displayName } = req.body;

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ thông tin",
        });
      }

      // Kết nối database
      pool = await db.getConnection();

      // Check username exists
      const userCheck = await pool
        .request()
        .input("username", sql.NVarChar, username)
        .query("SELECT * FROM Users WHERE Username = @username");

      if (userCheck.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Tên đăng nhập đã được sử dụng",
        });
      }

      // Check email exists
      const emailCheck = await pool
        .request()
        .input("email", sql.NVarChar, email)
        .query("SELECT * FROM Users WHERE Email = @email");

      if (emailCheck.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email đã được sử dụng",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const result = await pool
        .request()
        .input("Username", sql.NVarChar, username)
        .input("Email", sql.NVarChar, email)
        .input("Password", sql.NVarChar, hashedPassword)
        .input("DisplayName", sql.NVarChar, displayName || username).query(`
          INSERT INTO Users (
            Username, Email, Password, DisplayName,
            IsVerified, IsActive 
          )
          VALUES (
            @Username, @Email, @Password, @DisplayName,
            0, 1
          );
          SELECT SCOPE_IDENTITY() as UserID;
        `);

      // Add default member role
      await pool
        .request()
        .input("UserID", sql.Int, result.recordset[0].UserID)
        .input("RoleID", sql.Int, 5) // ID của role Member
        .query(`
          INSERT INTO UserRoles (UserID, RoleID)
          VALUES (@UserID, @RoleID)
        `);

      res.json({
        success: true,
        message: "Đăng ký thành công",
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server, vui lòng thử lại sau",
      });
    } finally {
      if (pool) {
        await pool.close();
      }
    }
  }
}

module.exports = new AuthController();
