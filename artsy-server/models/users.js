// this is where we handle all raw data relating to users from db

const mysql2 = require("mysql2");
const dbconfig = require("../utils/dbconfig");
const pool = mysql2.createPool(dbconfig).promise();

class usersModel {
  async createUser(
    userName,
    avatarUrl,
    email,
    firebaseUid,
    birthday,
    location,
    bio,
    gender,
    interestsArray,
  ) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Step 1: Insert user
      const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");
      const QUERY = `INSERT INTO users (userName, avatarUrl, email, firebaseUid, birthday, location, bio, gender, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const [result] = await connection.query(QUERY, [
        userName,
        avatarUrl || null,
        email,
        firebaseUid,
        birthday || null,
        location || null,
        bio || null,
        gender || null,
        createdAt,
      ]);

      const userId = result.insertId;

      // Step 2: Insert interests if provided
      if (interestsArray && interestsArray.length > 0) {
        const values = interestsArray.map((genreId) => [userId, genreId]);
        await connection.query(
          `INSERT INTO userInterests (userId, genreId) VALUES ?`,
          [values],
        );
      }

      await connection.commit();
      return userId;
    } catch (err) {
      await connection.rollback();
      console.error("Register Transaction Error: ", err);
      throw err;
    } finally {
      connection.release();
    }
  }

  //get user by username
  async getUsersByName(userName) {
    try {
      const [results] = await pool.query(
        `SELECT userId, userName, avatarUrl, bio, location, gender, createdAt 
         FROM users WHERE userName = ?`,
        [userName],
      );
      return results[0] || null;
    } catch (err) {
      console.error("getUsersByName Error: ", err);
      throw err;
    }
  }

  //get allusers
  async getUsersPool() {
    try {
      const [results] = await pool.query(
        `SELECT userId, userName, avatarUrl, bio FROM users`,
      );
      return results;
    } catch (err) {
      console.error("getUsersPool Error: ", err);
      throw err;
    }
  }

  // get userposts
  async getUserPosts(userName) {
    try {
      const [results] = await pool.query(
        `SELECT p.postId, p.content, p.likeCount, p.commentCount, p.createdAt,
                pi.imageUrl
         FROM posts p
         LEFT JOIN postimages pi ON p.postId = pi.postId
         JOIN users u ON p.userId = u.userId
         WHERE u.userName = ? AND p.type = 1 AND p.isDeleted = 0
         ORDER BY p.createdAt DESC`,
        [userName],
      );
      return results;
    } catch (err) {
      console.error("getUserPosts Error: ", err);
      throw err;
    }
  }

  // get user Attended Events
  async getUserAttendedEvents(userName) {
    try {
      const [results] = await pool.query(
        `SELECT e.eventId, e.title, e.posterUrl, e.attendCount,
                ea.attendedAt, ea.rating
         FROM eventattended ea
         JOIN events e ON ea.eventId = e.eventId
         JOIN users u ON ea.userId = u.userId
         WHERE u.userName = ? AND ea.isDeleted = 0
         ORDER BY ea.attendedAt DESC`,
        [userName],
      );
      return results;
    } catch (err) {
      console.error("getUserAttendedEvents Error: ", err);
      throw err;
    }
  }

  // get user Stats
  async getUserStats(userName) {
    try {
      const [results] = await pool.query(
        `SELECT 
           COUNT(*) as eventsAttended,
           COUNT(rating) as totalReviews,
           ROUND(AVG(rating), 1) as averageRating
         FROM eventattended ea
         JOIN users u ON ea.userId = u.userId
         WHERE u.userName = ? AND ea.isDeleted = 0`,
        [userName],
      );
      return results[0];
    } catch (err) {
      console.error("getUserStats Error: ", err);
      throw err;
    }
  }

  // get user Journal
  async getUserJournal(userName, sort) {
    const sortOptions = {
      newest: "p.createdAt DESC",
      oldest: "p.createdAt ASC",
      highest: "ea.rating DESC",
      lowest: "ea.rating ASC",
    };
    const orderBy = sortOptions[sort] || "p.createdAt DESC";

    try {
      const [results] = await pool.query(
        `SELECT p.postId, p.content, p.createdAt,
                e.title as eventTitle, e.posterUrl,
                ea.rating, ea.attendedAt
         FROM posts p
         JOIN eventattended ea ON p.eventAttendId = ea.eventAttendId
         JOIN events e ON ea.eventId = e.eventId
         JOIN users u ON p.userId = u.userId
         WHERE u.userName = ? AND p.type = 1 
         AND p.eventAttendId IS NOT NULL AND p.isDeleted = 0
         ORDER BY ${orderBy}`,
        [userName],
      );
      return results;
    } catch (err) {
      console.error("getUserJournal Error: ", err);
      throw err;
    }
  }
}

module.exports = new usersModel();
