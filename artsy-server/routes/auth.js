// this is the router for authentication related stuff
//functions:
// A. generate Csrftoken (called in frontend before sending login info)
// B. login
// C. logout
// D. check user session cookie

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
router.get("/csrf-token", authController.getCsrfToken);
router.post("/sessionLogin", authController.sessionLogin);
router.post("/sessionLogout", authController.sessionLogout);
router.get("/check-auth", authController.checkAuth);
router.get("/authenticate", authController.authenticate);

module.exports = router;

