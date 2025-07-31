const express = require("express");
const router = express.Router();
const { checkPermission } = require("../middleware/auth-role.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const AddMovieController = require("../controllers/admin/add-movie.controller");
const editMovieController = require("../controllers/admin/edit-movie.controller");
const serverController = require("../controllers/admin/server.controller");
const episodeController = require("../controllers/admin/episode.controller");
const movieController = require("../controllers/admin/movie.controller");
const userController = require("../controllers/admin/user.controller");
const {
  MovieRatingController,
} = require("../controllers/movie/movieRating.controller");
const {
  WatchLaterController,
} = require("../controllers/movie/watchLater.controller");
// Route thêm phim mới - yêu cầu quyền ADD_MOVIE
router.post(
  "/add-movies",
  authMiddleware,
  checkPermission(["ADD_MOVIE"]),
  AddMovieController.addMovie
);
// movie.routes.js
router.put(
  "/update-movies/:id",
  authMiddleware,
  checkPermission(["EDIT_MOVIE"]),
  editMovieController.updateMovie
);
router.delete(
  "/delete-movies/:id",
  authMiddleware,
  checkPermission(["DELETE_MOVIE"]),
  movieController.adminDeleteMovie
);
router.get(
  "/servers/",
  authMiddleware,
  checkPermission(["FULL_CONTROL"]),
  serverController.getServers
);
router.post(
  "/servers",
  authMiddleware,
  checkPermission(["FULL_CONTROL"]),
  serverController.addServer
);
router.put(
  "/servers/:id",
  authMiddleware,
  checkPermission(["FULL_CONTROL"]),
  serverController.updateServer
);
router.delete(
  "/servers/:id",
  authMiddleware,
  checkPermission(["FULL_CONTROL"]),
  serverController.deleteServer
);
// Lấy danh sách tập phim của một bộ phim
router.get(
  "/episodes/:movieId",
  authMiddleware,
  checkPermission(["FULL_CONTROL", "VIEW_MOVIE"]),
  episodeController.getEpisodes
);

// Thêm mới tập phim
router.post(
  "/episodes",
  authMiddleware,
  checkPermission(["FULL_CONTROL", "ADD_MOVIE"]),
  episodeController.addEpisode
);

// Sửa tập phim
router.put(
  "/episodes/:id",
  authMiddleware,
  checkPermission(["FULL_CONTROL", "EDIT_MOVIE"]),
  episodeController.updateEpisode
);

// Xóa tập phim
router.delete(
  "/episodes/:id",
  authMiddleware,
  checkPermission(["FULL_CONTROL", "DELETE_MOVIE"]),
  episodeController.deleteEpisode
);

router.get(
  "/users",
  authMiddleware,
  checkPermission(["FULL_CONTROL"]),
  userController.getUsers
);
router.delete(
  "/users/:id",
  authMiddleware,
  checkPermission(["FULL_CONTROL"]),
  userController.deleteUser
);


module.exports = router;
