// this is the controller for user related stuff
//functions:
//A. create user / register
//B. get all users
//C. get user by username
//D. get user Attended Events
//E. get user Stats: metrics of their interactions
//F. get top user reviewers
//G. get user Journal, with different sorted options: newest/oldest/highest/lowest
//H. edit user bio
//I. get user interests
//J. edit user avatar

const usersModel = require("../models/users.js");
const { admin } = require("../utils/firebaseAdmin.js");
const { processUploadedImages } = require("./imagesController");

class userController {
  //A. create a new user/register
  async createUser(req, res) {
    try {
      // const { userName, idToken, bio, gender, interests } = req.body;
      const { idToken, userName, gender, birthday, interests } = req.body;

      if (!userName || !idToken) {
        return res.status(400).send("userName and idToken are required");
      }

      //ask firebase to verify idToken and return decoded firebaseUid and email
      const decoded = await admin.auth().verifyIdToken(idToken);
      const firebaseUid = decoded.uid;
      const authEmail = decoded.email;

      //get avatar url
      let avatarUrl = await processUploadedImages(req.files);
      // if (req.files && req.files.avatar) {
      //   const path = require('path');
      //   const fs = require('fs');
      //   const avatar = req.files.avatar;
      //   const uploadDir = path.join(__dirname, "..", "public", "uploads", "avatars");
      //   if (!fs.existsSync(uploadDir)) {
      //     fs.mkdirSync(uploadDir, { recursive: true });
      //   }
      //   const fileName = `avatar-${Date.now()}${path.extname(avatar.name)}`;
      //   const savePath = path.join(uploadDir, fileName);
      //   await avatar.mv(savePath);
      //   avatarUrl = `http://localhost:3005/ad-uploads/avatars/${fileName}`;

      // }


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
        // bio,
        gender,
        interestsArray,

      );

      res
        .status(201)
        .json({ message: "User registered successfully", userId: Number(userId), avatarUrl });
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
      res.status(500).send(error.message || error.toString());
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


  //H. edit user bio
  async editUserBio(req, res) {
    try {
      const username = req.params.username;
      const { bio } = req.body;
      const updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
      await usersModel.editUserBio(username, bio, updatedAt);
      res.json({ message: 'Bio updated' });
    } catch (err) {
      if (err.message === 'User-not-found') {
        res.status(404).json({ error: 'User not found' });
      } else {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  // edit user interests
  async editUserInterests(req, res) {
    try {
      const username = req.params.username;
      const { interests } = req.body;
      const updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
      await usersModel.editUserInterests(username, interests, updatedAt);
      res.json({ message: 'Interests updated' });
    } catch (err) {
      if (err.message === 'User-not-found') {
        res.status(404).json({ error: 'User not found' });
      } else {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  //I. get user interests
  async getUserInterests(req, res) {
    try {
      const Interests = await usersModel.getUserInterests(req.params.userId);
      res.json(Interests);
    } catch (err) {
      console.error("getUserInterests Error: ", err);
      res.status(500).send("Internal Server Error");
    }
  }

  //J. edit user avatar
  async editUserAvatar(req, res) {
    try {
      if (!req.files || !req.files.images) {
        return res.status(400).json({ error: 'No avatar file provided' });
      }
      const avatarUrl = await processUploadedImages({ images: req.files.images });
      if (!avatarUrl.length) return res.status(400).json({ error: 'Image processing failed' });
      const fullAvatarUrl = `https://2526-cs7025-group2.scss.tcd.ie/${avatarUrl[0]}`;
      await usersModel.editUserAvatar(req.user.userName, fullAvatarUrl);
      res.json({ message: 'Avatar updated', fullAvatarUrl });
    } catch (err) {
      if (err.message === 'User-not-found') {
        return res.status(404).json({ error: 'User not found' });
      }
      console.error('editUserAvatar Error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  }

}
module.exports = new userController();
