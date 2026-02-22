const eventModel = require("../models/eventModel");
const apiService = require("../services/apiService");

class EventController {
  /**
   * Home page — fetches & caches events, then shows them.
   */
  async getHomePage(req, res) {
    try {
      // Pull fresh events from APIs and cache them
      const [theatreEvents, films] = await Promise.all([
        apiService.fetchTicketmasterEvents("KnvZfZ7v7l1"), // Theatre genre
        apiService.fetchNowShowingFilms(),
      ]);

      // categoryId 2 = Theatre, 3 = Film (from our seed data)
      await eventModel.saveEvents(theatreEvents, 2);
      await eventModel.saveEvents(films, 3);

      const events     = await eventModel.getAllEvents();
      const categories = await eventModel.getAllCategories();

      res.render("pages/home", { title: "Artsy Dublin", events, categories, error: null });
    } catch (err) {
      console.error("EventController.getHomePage error:", err.message);
      res.render("pages/home", { title: "Artsy Dublin", events: [], categories: [], error: "Could not load events right now." });
    }
  }

  /**
   * All events page with optional category filter.
   */
  async getAllEvents(req, res) {
    try {
      const { categoryId } = req.query;
      const events         = await eventModel.getAllEvents(categoryId || null);
      const categories     = await eventModel.getAllCategories();

      res.render("pages/events", { title: "All Events — Artsy Dublin", events, categories, selectedCategory: categoryId || null, error: null });
    } catch (err) {
      console.error("EventController.getAllEvents error:", err.message);
      res.render("pages/events", { title: "All Events", events: [], categories: [], selectedCategory: null, error: "Could not load events." });
    }
  }

  /**
   * Single event detail page.
   */
  async getEventDetail(req, res) {
    try {
      const { eventId } = req.params;
      const event = await eventModel.getEventById(eventId);

      if (!event) {
        return res.status(404).render("pages/events", {
          title: "Not Found", events: [], categories: [], selectedCategory: null, error: "Event not found."
        });
      }

      res.render("pages/eventDetail", { title: event.title, event, error: null });
    } catch (err) {
      console.error("EventController.getEventDetail error:", err.message);
      res.status(500).send("Error loading event details.");
    }
  }
}

module.exports = new EventController();