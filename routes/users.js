// this is the router for user related stuff

const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.get('/:username', usersController.getUserByName);
router.get('/',usersController.getUsersPool);

module.exports = router;