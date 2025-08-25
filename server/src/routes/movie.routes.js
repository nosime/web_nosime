// server/src/routes/auth.routes.js
const express = require("express");
const router = express.Router();

const listMoviesController = require("../controllers/movie/listMovies.controller");
const listMoviesRDController = require("../controllers/movie/listMoviesRD.controller");
const listMoviesTopController = require("../controllers/movie/listMoviesTop.controller");
const movieDetailController = require("../controllers/movieDetail.controller");
const languagesController = require("../controllers/movie/languages.controller");

router.get("/movie/:slug", movieDetailController.getMovieBySlug);
//Router lấy danh sách phim với phân trang (pagedefaut=1, limitdefault=24)
router.get("/movies", listMoviesController.getMoviesListPaginatedLimit);
router.get("/movies/:page", listMoviesController.getMoviesListPaginatedLimit);
router.get(
  "/movies/:page/:limit",
  listMoviesController.getMoviesListPaginatedLimit
);

//Router lấy danh sách phim random (limitdefault=10)
router.get("/movies-rdns/:limit", listMoviesRDController.getRandomMovies);
router.get("/movies-rdns", listMoviesRDController.getRandomMovies);

//Router lấy danh sách phim random với phân trang (pagedefaut=1, limitdefault=24)
router.get("/movies-rdn", listMoviesRDController.getMoviesListPaginatedRandom);
router.get(
  "/movies-rdn/:page",
  listMoviesRDController.getMoviesListPaginatedRandom
);
router.get(
  "/movies-rdn/:page/:limit",
  listMoviesRDController.getMoviesListPaginatedRandom
);

// Top viewed movies
router.get("/top-views/", listMoviesTopController.getTopViewMovies);
// Languages
router.get("/languages", languagesController.getUniqueLanguages);

module.exports = router;
