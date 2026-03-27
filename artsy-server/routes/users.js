// this is the router for user related stuff

const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.get("/:username", usersController.getUserByName);
router.get("/", usersController.getUsersPool);

//router.delete('/:username',usersController.deleteUser);
router.post("/register", usersController.createUser);

module.exports = router;
