// this is the controller for user related stuff

const usersModel = require("../models/users");

class userController {
  //fetch all users
  async getUserByName(req, res) {
    const userProfile = await usersModel.getUsersByName(req.params.username);
    if (!userProfile) return res.status(404).send("user not found");
    res.json(userProfile);
  }
  //fetch single user profile information
  async getUsersPool(req, res) {
    const usersPool = await usersModel.getUsersPool();
    if (!usersPool) return res.status(404).send("user not found");
    res.json(usersPool);
  }

  //create a new user
  async createUser(req, res) {
    try {
      const {
        userName,
        email,
        firebaseUid,
        birthday,
        location,
        bio,
        gender,
        interests,
      } = req.body;

      if (!userName || !email || !firebaseUid) {
        return res
          .status(400)
          .send("userName, email and firebaseUid are required");
      }

      const avatarUrl = req.file
        ? `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`
        : null;

      const interestsArray = interests
        ? Array.isArray(interests)
          ? interests
          : JSON.parse(interests)
        : [];

      const userId = await usersModel.createUser(
        userName,
        avatarUrl,
        email,
        firebaseUid,
        birthday,
        location,
        bio,
        gender,
        interestsArray,
      );

      if (!userId) {
        return res.status(500).send("User not created");
      }

      res
        .status(201)
        .json({ message: "User registered successfully", userId, avatarUrl });
    } catch (error) {
      console.error("Register Error:", error);
      res.status(500).send("Internal Server Error");
    }
  }
  // My Diary in home page
  async getUserPosts(req, res) {
    try {
      const posts = await usersModel.getUserPosts(req.params.username);
      res.json(posts);
    } catch (error) {
      console.error("getUserPosts Error:", error);
      res.status(500).send("Internal Server Error");
    }
  }
  // Attended Events
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

  // Stats
  async getUserStats(req, res) {
    try {
      const stats = await usersModel.getUserStats(req.params.username);
      res.json(stats);
    } catch (error) {
      console.error("getUserStats Error:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  // Journal Entries
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
