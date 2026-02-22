const mysql    = require("mysql2/promise");
const DBCONFIG = require("../config/dbconfig");

class EventModel {
  /**
   * Get all events, optionally filtered by category.
   */
  async getAllEvents(categoryId = null) {
    const connection = await mysql.createConnection(DBCONFIG);
    try {
      let query  = "SELECT e.*, ec.categoryName FROM events e LEFT JOIN eventCategories ec ON e.categoryId = ec.categoryId";
      const params = [];

      if (categoryId) {
        query += " WHERE e.categoryId = ?";
        params.push(categoryId);
      }

      query += " ORDER BY e.date ASC";
      const [results] = await connection.query(query, params);
      return results;
    } catch (err) {
      console.error("EventModel.getAllEvents error:", err.message);
      throw err;
    } finally {
      await connection.end();
    }
  }

  /**
   * Get a single event by ID.
   */
  async getEventById(eventId) {
    const connection = await mysql.createConnection(DBCONFIG);
    try {
      const query   = "SELECT e.*, ec.categoryName FROM events e LEFT JOIN eventCategories ec ON e.categoryId = ec.categoryId WHERE e.eventId = ?";
      const [rows]  = await connection.query(query, [eventId]);
      return rows[0] || null;
    } catch (err) {
      console.error("EventModel.getEventById error:", err.message);
      throw err;
    } finally {
      await connection.end();
    }
  }

  /**
   * Save an array of normalised events to the database.
   * Uses INSERT IGNORE to avoid duplicates on title+date.
   */
  async saveEvents(events, categoryId) {
    const connection = await mysql.createConnection(DBCONFIG);
    try {
      const query = `
        INSERT INTO events (title, date, venue, eventUrl, posterUrl, source, categoryId)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE updatedAt = NOW()
      `;
      for (const event of events) {
        await connection.query(query, [
          event.title,
          event.date,
          event.venue,
          event.eventUrl,
          event.posterUrl,
          event.source,
          categoryId,
        ]);
      }
    } catch (err) {
      console.error("EventModel.saveEvents error:", err.message);
      throw err;
    } finally {
      await connection.end();
    }
  }

  /**
   * Get all categories.
   */
  async getAllCategories() {
    const connection = await mysql.createConnection(DBCONFIG);
    try {
      const [results] = await connection.query("SELECT * FROM eventCategories");
      return results;
    } catch (err) {
      console.error("EventModel.getAllCategories error:", err.message);
      throw err;
    } finally {
      await connection.end();
    }
  }
}

module.exports = new EventModel();