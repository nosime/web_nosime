// server/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();

const searchMoviesController = require('../controllers/search/searchMovies.controller');
const filterMoviesController = require('../controllers/search/filterMovies.controller');


  // Search movies
  router.get('/search/', searchMoviesController.searchMovies);
  router.get('/search-type/', searchMoviesController.searchMoviesType);

  
  router.get('/filter/', filterMoviesController.filterMovies);
module.exports = router;