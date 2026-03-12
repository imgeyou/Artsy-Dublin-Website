// this is the router for event related stuff

const express = require("express");
const router = express.Router();
const controller = require("../controllers/eventsController");

router.get("/", controller.get);
router.get("/update", controller.update);

module.exports = router;