const express = require("express");
const router = express.Router();
const genresController = require("../controllers/genresController");

router.get("/", genresController.getAllGenres);
router.get("/eventtypes", genresController.getAllEventTypes);

module.exports = router;
