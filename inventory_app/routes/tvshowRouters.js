const express = require('express');
const router = express.Router();
const tvshowController = require('../controllers/tvshowController');

router.get('/',tvshowController.favAllTvShows)
router.get('/new',tvshowController.addTvShowGet)
router.post('/new',tvshowController.addTvShowPost)
router.get('/deletetvshows', tvshowController.toDeleteTvShows);
router.post('/delete/:id', tvshowController.deleteTvShowById);

module.exports = router;