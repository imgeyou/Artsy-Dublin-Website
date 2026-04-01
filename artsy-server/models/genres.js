const mysql2 = require("mysql2");
const dbconfig = require("../utils/dbconfig");
const pool = mysql2.createPool(dbconfig).promise();

class GenresModel {
  // Get all event types
  async getAllEventTypes() {
    try {
      const QUERY = `SELECT eventTypeId, eventTypeName FROM eventTypes`;
      const [rows] = await pool.query(QUERY);
      return rows;
    } catch (err) {
      console.error("Get EventTypes Error: ", err);
      throw err;
    }
  }

  // Get all genres, optionally filtered by eventTypeId
  async getAllGenres(eventTypeId = null) {
    try {
      let QUERY = `SELECT genreId, name, eventTypeId FROM genres`;
      const params = [];

      if (eventTypeId) {
        QUERY += ` WHERE eventTypeId = ?`;
        params.push(eventTypeId);
      }

      const [rows] = await pool.query(QUERY, params);
      return rows;
    } catch (err) {
      console.error("Get Genres Error: ", err);
      throw err;
    }
  }
}

module.exports = new GenresModel();
