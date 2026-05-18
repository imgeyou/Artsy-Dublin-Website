// this is where we handle all raw data relating to users from db
//functions:
//A. create user / register
//B. get user by username
//C. get all users
//D. get user info by firebaseUid (used by checkAuth)
//E. get user Attended Events
//F. get user Stats: metrics of their interactions
//G. get top reviewers
//H. get user Journal, with different sorted options: newest/oldest/highest/lowest
//I. edit user bio
//J. get user interests

const mysql2 = require("mysql2");
const dbconfig = require("../utils/dbconfig");
const pool = mysql2.createPool(dbconfig).promise();

class usersModel {
  //A. create user / register
  async createUser(
    userName,
    avatarUrl,
    email,
    firebaseUid,
    //bio,
    gender,
    interestsArray,
  ) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      //beginTransaction() wrap two steps:
      //1. INSERT INTO users — creates the user row
      //2. INSERT INTO userInterests — saves their selected genres
      //if one fails, all fail

      // Step 1: Insert user
      const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");
      const QUERY = `INSERT INTO users (userName, avatarUrl, email, firebaseUid, bio, gender, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const fullAvatarUrl = `https://2526-cs7025-group2.scss.tcd.ie/${avatarUrl}`;
      const [result] = await connection.query(QUERY, [
        userName,
        fullAvatarUrl || null,
        email,
        firebaseUid,
        /*bio ||*/ null,
        gender || null,
        createdAt,
      ]);

      const userId = result.insertId;

      // Step 2: Insert interests if provided
      if (interestsArray && interestsArray.length > 0) {
        const [validGenres] = await connection.query(
          `SELECT genreId FROM genres WHERE genreId IN (?)`,
          [interestsArray],
        );

        const validIds = validGenres.map((g) => g.genreId);
        if (validIds.length > 0) {
          const placeholders = validIds.map(() => '(?,?)').join(',');
          const flatValues = validIds.flatMap((genreId) => [userId, genreId]);
          await connection.query(
            `INSERT INTO userinterests (userId, genreId) VALUES ${placeholders}`,
            flatValues,
          );
        }
      }

      await connection.commit();
      return userId;
    } catch (err) {
      await connection.rollback(); //if one step fails, all fail
      console.error("Register Transaction Error: ", err);
      throw err;
    } finally {
      connection.release();
    }
  }

  //B. get user by username
  async getUserByName(userName) {
    try {
      const [results] = await pool.query(
        `SELECT userId, userName, avatarUrl, bio, location, gender, createdAt
         FROM users WHERE userName = ?`,
        [userName],
      );
      return results[0] || null;
    } catch (err) {
      console.error("getUserByName Error: ", err);
      throw err;
    }
  }

  //C. get all users
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

  //D. get logined user info by firebaseUid
  async getUserByFirebaseUid(firebaseUid) {
    try {
      const [results] = await pool.query(
        `SELECT userId, userName, avatarUrl FROM users WHERE firebaseUid = ?`,
        [firebaseUid],
      );
      return results[0] || null;
    } catch (err) {
      console.error("getUserByFirebaseUid Error: ", err);
      throw err;
    }
  }

  //E. get user Attended Events
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

  // F. get user Stats: metrics of their interactions
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
      const result = results[0];
      return {
        eventsAttended: Number(result.eventsAttended),
        totalReviews: Number(result.totalReviews),
        averageRating: result.averageRating ? Number(result.averageRating) : null,
      };
    } catch (err) {
      console.error("getUserStats Error: ", err);
      throw err;
    }
  }

   // G. get top reviewers
  async getTopReviewers(limit = 5) {
    try {
      const [results] = await pool.query(
        `SELECT userName, avatarUrl, reviewCount
         FROM users
         WHERE reviewCount > 0
         ORDER BY reviewCount DESC
         LIMIT ?`,
        [limit],
      );
      return results;
    } catch (err) {
      console.error("getTopReviewers Error: ", err);
      throw err;
    }
  }

  // H. get user Journal
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

  //I. edit user bio
  async editUserBio(username, bioContent, updatedAt) {
        let que;
        try {
            que = await pool.getConnection();

            const [results] = await que.query(
                `UPDATE users
                SET bio = ?, updatedAt = ?
                WHERE userName = ?
                `,[bioContent, updatedAt, username]
            );

            if (results.affectedRows === 0) throw new Error('User-not-found');

        } catch (err) {
            console.error("Query Error: " + err);
            throw err;
        } finally {
            if (que) que.release();
        }
    }


  // edit user interests
  async editUserInterests(username, interests, updatedAt) {
        let que;
        try {
            que = await pool.getConnection();

            // delete all previous userid entries in userinterests table
            await que.query(
              `DELETE FROM userinterests
              WHERE userid = ?`, [username]
            );

            // add the interests one by one
            if (interests && interests.length > 0) {
              const [validGenres] = await que.query(
                `SELECT genreId FROM genres WHERE genreId IN (?)`,
                [interests],
              );

            const validIds = validGenres.map((g) => g.genreId);
            if (validIds.length > 0) {
              const placeholders = validIds.map(() => '(?,?)').join(',');
              const flatValues = validIds.flatMap((genreId) => [username, genreId]);
              await que.query(
                `INSERT INTO userinterests (userId, genreId) VALUES ${placeholders}`,
                flatValues,
              );
            }
            }

        } catch (err) {
            console.error("Query Error: " + err);
            throw err;
        } finally {
            if (que) que.release();
        }
    }

    //J. get user interests
    async getUserInterests(userId) {
      try {
        const [results] = await pool.query(
        `SELECT g.genreId, g.name, g.eventTypeId
          FROM userinterests ui
          JOIN genres g ON ui.genreId = g.genreId
          JOIN users u ON ui.userId = u.userId
          WHERE u.userId = ?`,
          [userId],
        );
      return results;
      } catch (err) {
        console.error("getUserInterests Error: ", err);
        throw err;
      }
    }
    //K. update avatar URL
    async editUserAvatar(username, avatarUrl) {
        let que;
        try {
            que = await pool.getConnection();
            const [results] = await que.query(
                `UPDATE users SET avatarUrl = ?, updatedAt = NOW() WHERE userName = ?`,
                [avatarUrl, username]
            );
            if (results.affectedRows === 0) throw new Error('User-not-found');
        } catch (err) {
            console.error("Query Error: " + err);
            throw err;
        } finally {
            if (que) que.release();
        }
    }
}

module.exports = new usersModel();
