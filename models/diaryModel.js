const mysql    = require("mysql2/promise");
const DBCONFIG = require("../config/dbconfig");

class DiaryModel {
  /**
   * Get all diary entries with their linked event info.
   */
  async getAllEntries() {
    const connection = await mysql.createConnection(DBCONFIG);
    try {
      const query = `
        SELECT d.*, e.title AS eventTitle, e.posterUrl
        FROM diary_entries d
        LEFT JOIN events e ON d.eventId = e.eventId
        ORDER BY d.createdAt DESC
      `;
      const [results] = await connection.query(query);
      return results;
    } catch (err) {
      console.error("DiaryModel.getAllEntries error:", err.message);
      throw err;
    } finally {
      await connection.end();
    }
  }

  /**
   * Get a single diary entry with its comments.
   */
  async getEntryById(entryId) {
    const connection = await mysql.createConnection(DBCONFIG);
    try {
      const [entryRows] = await connection.query(
        `SELECT d.*, e.title AS eventTitle, e.date, e.venue, e.posterUrl
         FROM diary_entries d
         LEFT JOIN events e ON d.eventId = e.eventId
         WHERE d.entryId = ?`,
        [entryId]
      );

      const [comments] = await connection.query(
        "SELECT * FROM comments WHERE entryId = ? ORDER BY createdAt ASC",
        [entryId]
      );

      return { entry: entryRows[0] || null, comments };
    } catch (err) {
      console.error("DiaryModel.getEntryById error:", err.message);
      throw err;
    } finally {
      await connection.end();
    }
  }

  /**
   * Create a new diary entry.
   */
  async createEntry({ eventId, rating, reviewText, imageUrl }) {
    const connection = await mysql.createConnection(DBCONFIG);
    try {
      const [result] = await connection.query(
        "INSERT INTO diary_entries (eventId, rating, reviewText, imageUrl) VALUES (?, ?, ?, ?)",
        [eventId, rating, reviewText, imageUrl]
      );
      return result.insertId;
    } catch (err) {
      console.error("DiaryModel.createEntry error:", err.message);
      throw err;
    } finally {
      await connection.end();
    }
  }

  /**
   * Add a comment to a diary entry.
   */
  async addComment({ entryId, content }) {
    const connection = await mysql.createConnection(DBCONFIG);
    try {
      await connection.query(
        "INSERT INTO comments (entryId, content) VALUES (?, ?)",
        [entryId, content]
      );
    } catch (err) {
      console.error("DiaryModel.addComment error:", err.message);
      throw err;
    } finally {
      await connection.end();
    }
  }
}

module.exports = new DiaryModel();