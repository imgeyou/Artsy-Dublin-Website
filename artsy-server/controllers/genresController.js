const genresModel = require("../models/genres");

const genresController = {
  // Get all event types
  async getAllEventTypes(req, res) {
    try {
      const eventTypes = await genresModel.getAllEventTypes();
      res.status(200).json(eventTypes);
    } catch (error) {
      console.error("Get EventTypes Error:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Get all genres, optionally filtered by eventTypeId
  async getAllGenres(req, res) {
    try {
      const { eventTypeId } = req.query;
      const genres = await genresModel.getAllGenres(eventTypeId || null);
      res.status(200).json(genres);
    } catch (error) {
      console.error("Get Genres Error:", error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = genresController;
