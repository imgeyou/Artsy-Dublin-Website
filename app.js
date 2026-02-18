const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const ticketmaster_api = axios.create({
  baseURL: "https://app.ticketmaster.com/discovery/v2/",
  params: { apikey: process.env.Ticketmaster_API_KEY },
});

app.get("/api/theatre-events", async (req, res) => {
  try {
    const response = await ticketmaster_api.get("events", {
      params: { countryCode: "IE", genreId: "KnvZfZ7v7l1", sort: "date,asc" },
    });

    const events = response.data?._embedded?.events || [];
    const cleanData = events.map((e) => ({
      name: e.name,
      date: e.dates.start.localDate,
      url: e.url,
      venue: e._embedded?.venues[0]?.name,
    }));

    res.json(cleanData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
