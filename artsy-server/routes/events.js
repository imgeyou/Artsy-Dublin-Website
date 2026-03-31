// this is the router for event related stuff

const express = require("express");
const router = express.Router();
const controller = require("../controllers/eventsController");

// GET EVENTS
router.get("/", controller.get);
router.get("/:typename", controller.getEventsByType); // typenames: "Arts-&-Theater", "Music", "Film-Showing"
router.get("/genre/:genrename", controller.getEventsByGenre); // genrenames, e.g.: "Alternative-Rock", "Theatre", "Adventure"

// UPDATE EVENTS
router.get("/update/:typename", controller.updateByType); // typenames: "Arts-&-Theater", "Music" (ticketmaster) "Film-Showing" (tmdb)

// GET SINGLE EVENT DATA
router.get("/event/:eventid", controller.getEventById);

module.exports = router;