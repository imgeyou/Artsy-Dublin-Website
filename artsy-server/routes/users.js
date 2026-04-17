// this is the router for user related stuff

const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const upload = require("../utils/upload");

router.get("/", usersController.getUsersPool);
router.get("/top-reviewers", usersController.getTopReviewers);
router.get("/:username", usersController.getUserByName);
router.get("/:username/attended-events", usersController.getUserAttendedEvents);
router.get("/:username/stats", usersController.getUserStats);
router.get("/:username/journal", usersController.getUserJournal);

// upload.single("avatar") processes the avatar file before hitting the controller
router.post("/register", upload.single("avatar"), usersController.createUser);

module.exports = router;
