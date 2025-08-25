// action.routes.js
const express = require("express");
const router = express.Router();
const {
  MovieRatingController,
} = require("../controllers/movie/movieRating.controller");
const {
  WatchLaterController,
} = require("../controllers/movie/watchLater.controller");
const ViewHistoryController = require('../controllers/movie/viewHistory.controller');
const { checkStatus } = require("../controllers/movieDetail.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Check movie status (requires auth)
router.get("/movies-status/:movieId", authMiddleware, checkStatus);

// Toggle watch later status
router.post(
  "/watch-later/toggle",
  authMiddleware,
  WatchLaterController.toggleWatchLater
);

// Toggle like status
router.post(
  "/movies/toggle-like",
  authMiddleware,
  MovieRatingController.toggleLike
);

// Lấy danh sách phim yêu thích
router.get("/favorites", authMiddleware, MovieRatingController.getFavorites);

// Lấy danh sách phim xem sau 
router.get("/watch-later", authMiddleware, WatchLaterController.getWatchLater);


// Lấy danh sách phim yêu thích theo user
router.get("/favorites/:userId", authMiddleware, MovieRatingController.getFavorites);

// Lấy danh sách phim xem sau theo user
router.get("/watch-later/:userId", authMiddleware, WatchLaterController.getWatchLater);



// Lưu lịch sử xem
router.post("/view-history", authMiddleware,ViewHistoryController.saveViewHistory);

// Lấy lịch sử xem
router.get("/view-history-user", authMiddleware,ViewHistoryController.getUserHistory); 

// Lấy lịch sử xem theo user
router.get("/view-history-user/:userId", authMiddleware,ViewHistoryController.getUserHistory); 

module.exports = router;
