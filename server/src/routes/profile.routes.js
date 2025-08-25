// server/src/routes/profile.routes.js
const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Get user profile - GET /api/profile
router.get("/", authMiddleware, profileController.getProfile);

// Update user profile - PUT /api/profile
router.put("/", authMiddleware, profileController.updateProfile);

// Change password - POST /api/profile/change-password
router.post(
  "/change-password",
  authMiddleware,
  profileController.changePassword
);

module.exports = router;
