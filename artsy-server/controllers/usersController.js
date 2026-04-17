// this is the controller for user related stuff
//functions:
//A. create user / register
//B. get all users
//C. get user by username
//D. get user Attended Events
//E. get user Stats: metrics of their interactions
//F. get user Journal, with different sorted options: newest/oldest/highest/lowest


const usersModel = require("../models/users");
const { admin } = require("../utils/firebaseAdmin");

class userController {
  //A. create a new user/register
  async createUser(req, res) {
    try {
      const { userName, idToken, bio, gender, interests } = req.body;

      if (!userName || !idToken) {
        return res.status(400).send("userName and idToken are required");
      }

      //ask firebase to verify idToken and return decoded firebaseUid and email
      const decoded = await admin.auth().verifyIdToken(idToken);
      const firebaseUid = decoded.uid;
      const authEmail = decoded.email;

      //get avatar url
      const avatarUrl = req.file
        ? `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`
        : null;

      //get interest array
      const interestsArray = interests
        ? Array.isArray(interests)
          ? interests
          : JSON.parse(interests)
        : [];

      //send all the info to model to be added to the database
      const userId = await usersModel.createUser(
        userName,
        avatarUrl,
        authEmail,
        firebaseUid,
        bio,
        gender,
        interestsArray,
      );

      res
        .status(201)
        .json({ message: "User registered successfully", userId, avatarUrl });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        if (error.sqlMessage.includes("userName")) {
          return res.status(400).send("Username already exists");
        }
        if (error.sqlMessage.includes("email")) {
          return res.status(400).send("Email already exists");
        }
        return res.status(400).send("User already exists");
      }
      console.error("Register Error:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  //B. fetch single user profile information
  async getUsersPool(req, res) {
    const usersPool = await usersModel.getUsersPool();
    if (!usersPool) return res.status(404).send("user not found");
    res.json(usersPool);
  }

  //C. fetch all users
  async getUserByName(req, res) {
    const userProfile = await usersModel.getUserByName(req.params.username);
    if (!userProfile) return res.status(404).send("user not found");
    res.json(userProfile);
  }

  //D. Attended Events
  async getUserAttendedEvents(req, res) {
    try {
      const events = await usersModel.getUserAttendedEvents(
        req.params.username,
      );
      res.json(events);
    } catch (error) {
      console.error("getUserAttendedEvents Error:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  // E. Stats
  async getUserStats(req, res) {
    try {
      const stats = await usersModel.getUserStats(req.params.username);
      res.json(stats);
    } catch (error) {
      console.error("getUserStats Error:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  // F. Top Reviewers
  async getTopReviewers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const reviewers = await usersModel.getTopReviewers(limit);
      res.json(reviewers);
    } catch (error) {
      console.error("getTopReviewers Error:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  // G. Journal Entries
  async getUserJournal(req, res) {
    try {
      const sort = req.query.sort || "newest";
      const journal = await usersModel.getUserJournal(
        req.params.username,
        sort,
      );
      res.json(journal);
    } catch (error) {
      console.error("getUserJournal Error:", error);
      res.status(500).send("Internal Server Error");
    }
  }
}

module.exports = new userController();
