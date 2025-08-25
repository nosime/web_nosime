// server/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/sync/category.controller');
const countryController = require('../controllers/sync/country.controller');
const movieController = require('../controllers/sync/movie.controller')
const cleanMovieController = require('../controllers/sync/cleanMovieController');
const parallelMovieController = require('../controllers/sync/parallelMovieSync');
 // Đăng ký các routes
    router.get('/categories', categoryController.getCategories);
    router.get('/categories/:id', categoryController.getCategoriesById);
    router.post('/categories/sync', categoryController.syncCategories);
    
    // Country routes 
    router.post('/countries/sync', countryController.syncCountries);
    router.get('/countries', countryController.getCountries);
    router.get('/countries/:id', countryController.getCountryById);

    // Movie routes
    router.post('/movies/sync/:slug', movieController.syncMovieBySlug);
    router.post('/movies/sync-all', movieController.syncAllMovies);
    router.post('/movies/clean-all', cleanMovieController.cleanAllMovieData);
    router.post('/movies/parallel-sync', parallelMovieController.startParallelSync);
module.exports = router;