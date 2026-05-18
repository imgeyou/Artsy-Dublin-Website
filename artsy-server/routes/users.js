// this is the router for user related stuff

const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const upload = require("../utils/upload");
const { authenticate } = require("../controllers/authController");

router.get("/", usersController.getUsersPool);
router.get("/top-reviewers", usersController.getTopReviewers);
router.get("/:username", usersController.getUserByName);
router.get("/:username/attended-events", usersController.getUserAttendedEvents);
router.get("/:username/stats", usersController.getUserStats);
router.get("/:username/journal", usersController.getUserJournal);
router.get("/:userId/userinterests", usersController.getUserInterests);

//edit user bio
router.patch("/:username/bio", authenticate, usersController.editUserBio);

//edit user interests
router.patch("/:username/interests", authenticate, usersController.editUserInterests);

//edit user avatar
router.patch("/avatar", authenticate, usersController.editUserAvatar);

// upload.single("avatar") processes the avatar file before hitting the controller
//router.post("/register", upload.single("avatar"), usersController.createUser); 
router.post("/register", usersController.createUser); 

module.exports = router;
