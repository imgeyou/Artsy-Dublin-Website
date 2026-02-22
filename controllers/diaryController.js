const diaryModel = require("../models/diaryModel");
const eventModel = require("../models/eventModel");
const path       = require("path");

class DiaryController {
  /**
   * Show all diary entries.
   */
  async getDiary(req, res) {
    try {
      const entries = await diaryModel.getAllEntries();
      res.render("pages/diary", { title: "My Art Diary — Artsy Dublin", entries, error: null });
    } catch (err) {
      console.error("DiaryController.getDiary error:", err.message);
      res.render("pages/diary", { title: "My Art Diary", entries: [], error: "Could not load diary." });
    }
  }

  /**
   * Show a single diary entry with its comments.
   */
  async getDiaryEntry(req, res) {
    try {
      const { entryId } = req.params;
      const { entry, comments } = await diaryModel.getEntryById(entryId);

      if (!entry) return res.status(404).send("Entry not found.");

      res.render("pages/diaryEntry", { title: entry.eventTitle || "Diary Entry", entry, comments, error: null });
    } catch (err) {
      console.error("DiaryController.getDiaryEntry error:", err.message);
      res.status(500).send("Error loading entry.");
    }
  }

  /**
   * Show the "log attendance" form for an event.
   */
  async getLogForm(req, res) {
    try {
      const { eventId } = req.params;
      const event = await eventModel.getEventById(eventId);
      if (!event) return res.status(404).send("Event not found.");
      res.render("pages/logAttendance", { title: "Log Attendance", event, error: null });
    } catch (err) {
      console.error("DiaryController.getLogForm error:", err.message);
      res.status(500).send("Error loading form.");
    }
  }

  /**
   * Handle diary entry form submission (with optional image upload).
   */
  async postDiaryEntry(req, res) {
    try {
      const { eventId, rating, reviewText } = req.body;

      // Basic validation
      if (!rating || rating < 1 || rating > 5) {
        const event = await eventModel.getEventById(eventId);
        return res.render("pages/logAttendance", {
          title: "Log Attendance", event,
          error: "Please provide a rating between 1 and 5."
        });
      }

      if (reviewText && reviewText.length > 1000) {
        const event = await eventModel.getEventById(eventId);
        return res.render("pages/logAttendance", {
          title: "Log Attendance", event,
          error: "Review must be under 1000 characters."
        });
      }

      // Image path from multer (if uploaded)
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      await diaryModel.createEntry({
        eventId:    parseInt(eventId),
        rating:     parseInt(rating),
        reviewText: reviewText?.trim() || null,
        imageUrl,
      });

      res.redirect("/diary");
    } catch (err) {
      console.error("DiaryController.postDiaryEntry error:", err.message);
      res.status(500).send("Error saving diary entry.");
    }
  }

  /**
   * Handle comment submission.
   */
  async postComment(req, res) {
    try {
      const { entryId } = req.params;
      const { content }  = req.body;

      if (!content || content.trim().length === 0) {
        return res.redirect(`/diary/${entryId}?error=Comment+cannot+be+empty`);
      }

      if (content.length > 500) {
        return res.redirect(`/diary/${entryId}?error=Comment+too+long`);
      }

      await diaryModel.addComment({ entryId: parseInt(entryId), content: content.trim() });
      res.redirect(`/diary/${entryId}`);
    } catch (err) {
      console.error("DiaryController.postComment error:", err.message);
      res.status(500).send("Error posting comment.");
    }
  }
}

module.exports = new DiaryController();