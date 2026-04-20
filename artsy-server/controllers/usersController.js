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

  // H. Get user interests
  async getUserInterests(req, res) {
    try {
      const interests = await usersModel.getUserInterests(req.params.username);
      res.json(interests);
    } catch (error) {
      console.error("getUserInterests Error:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  // I. Update user interests (requires session auth)
  async updateUserInterests(req, res) {
    const sessionCookie = req.cookies?.session;
    if (!sessionCookie) return res.status(401).json({ error: "No session" });
    try {
      const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
      const user = await usersModel.getUserByFirebaseUid(decoded.uid);
      if (!user) return res.status(404).json({ error: "User not found" });
      if (user.userName !== req.params.username)
        return res.status(403).json({ error: "Forbidden" });
      const { genreIds } = req.body;
      await usersModel.updateUserInterests(user.userId, Array.isArray(genreIds) ? genreIds : []);
      res.json({ message: "Interests updated" });
    } catch (error) {
      console.error("updateUserInterests Error:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  // J. Update user bio (requires session auth)
  async updateUserBio(req, res) {
    const sessionCookie = req.cookies?.session;
    if (!sessionCookie) return res.status(401).json({ error: "No session" });
    try {
      const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
      const user = await usersModel.getUserByFirebaseUid(decoded.uid);
      if (!user) return res.status(404).json({ error: "User not found" });
      if (user.userName !== req.params.username)
        return res.status(403).json({ error: "Forbidden" });
      const { bio } = req.body;
      await usersModel.updateUserBio(user.userId, bio ?? null);
      res.json({ message: "Bio updated" });
    } catch (error) {
      console.error("updateUserBio Error:", error);
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
