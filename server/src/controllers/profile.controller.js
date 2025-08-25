// server/src/controllers/profile.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sql = require("mssql");
const db = require("../../database/database");
const path = require("path");
const fs = require("fs");

class ProfileController {
  // Get user profile controller
  async getProfile(req, res) {
    let pool;
    try {
      const userId = req.user.id; // From auth middleware

      // Kết nối database
      pool = await db.getConnection();

      // Get user profile
      const userResult = await pool.request().input("userId", sql.Int, userId)
        .query(`
          SELECT 
            UserID,
            Username,
            DisplayName,
            Email,
            Avatar,
            CreatedAt,
            UpdatedAt
          FROM Users 
          WHERE UserID = @userId
        `);

      if (userResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      const user = userResult.recordset[0];

      res.json({
        success: true,
        data: {
          UserID: user.UserID,
          Username: user.Username,
          DisplayName: user.DisplayName,
          Email: user.Email,
          Avatar: user.Avatar,
          CreatedAt: user.CreatedAt,
          UpdatedAt: user.UpdatedAt,
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
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

  // Update user profile controller
  async updateProfile(req, res) {
    let pool;
    try {
      const { displayName, email } = req.body;
      const userId = req.user.id; // From auth middleware

      // Validate input
      if (!displayName && !email) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập thông tin cần cập nhật",
        });
      }

      // Kết nối database
      pool = await db.getConnection();

      // Check if user exists
      const userCheck = await pool
        .request()
        .input("userId", sql.Int, userId)
        .query(`SELECT UserID FROM Users WHERE UserID = @userId`);

      if (userCheck.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      // Build update query dynamically
      let updateFields = [];
      let params = {};

      if (displayName) {
        updateFields.push("DisplayName = @displayName");
        params.displayName = displayName;
      }

      if (email) {
        // Check if email already exists
        const emailCheck = await pool
          .request()
          .input("email", sql.NVarChar, email)
          .input("userId", sql.Int, userId)
          .query(
            `SELECT UserID FROM Users WHERE Email = @email AND UserID != @userId`
          );

        if (emailCheck.recordset.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Email này đã được sử dụng",
          });
        }

        updateFields.push("Email = @email");
        params.email = email;
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Không có thông tin nào để cập nhật",
        });
      }

      updateFields.push("UpdatedAt = GETDATE()");

      // Execute update
      const request = pool.request().input("userId", sql.Int, userId);

      Object.keys(params).forEach((key) => {
        request.input(key, sql.NVarChar, params[key]);
      });

      await request.query(`
        UPDATE Users 
        SET ${updateFields.join(", ")}
        WHERE UserID = @userId
      `);

      // Get updated user info
      const updatedUser = await pool.request().input("userId", sql.Int, userId)
        .query(`
          SELECT 
            UserID,
            Username,
            DisplayName,
            Email,
            Avatar,
            CreatedAt,
            UpdatedAt
          FROM Users 
          WHERE UserID = @userId
        `);

      res.json({
        success: true,
        message: "Cập nhật thông tin thành công",
        data: updatedUser.recordset[0],
      });
    } catch (error) {
      console.error("Update profile error:", error);
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

  // Change password controller
  async changePassword(req, res) {
    let pool;
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id; // From auth middleware - using 'id' instead of 'UserID'

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ thông tin",
        });
      }

      // Validate new password length
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu mới phải có ít nhất 6 ký tự",
        });
      }

      // Kết nối database
      pool = await db.getConnection();

      // Get current user
      const userResult = await pool.request().input("userId", sql.Int, userId)
        .query(`
          SELECT UserID, Password 
          FROM Users 
          WHERE UserID = @userId
        `);

      if (userResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      const user = userResult.recordset[0];

      // Verify current password
      const validPassword = await bcrypt.compare(
        currentPassword,
        user.Password
      );
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: "Mật khẩu hiện tại không đúng",
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      // Update password in database
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("newPassword", sql.NVarChar, hashedNewPassword).query(`
          UPDATE Users 
          SET Password = @newPassword, 
              UpdatedAt = GETDATE()
          WHERE UserID = @userId
        `);

      res.json({
        success: true,
        message: "Đổi mật khẩu thành công",
      });
    } catch (error) {
      console.error("Change password error:", error);
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

module.exports = new ProfileController();
