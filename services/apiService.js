const axios   = require("axios");
require("dotenv").config();

// --- Ticketmaster client ---
const ticketmasterClient = axios.create({
  baseURL: "https://app.ticketmaster.com/discovery/v2/",
  params:  { apikey: process.env.Ticketmaster_API_KEY },
});

// --- TMDB client ---
const tmdbClient = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization:  `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
});

/**
 * Fetch upcoming theatre/music events in Ireland from Ticketmaster.
 * @param {string} genreId - Ticketmaster genre ID
 * @param {string} keyword - optional keyword filter
 * @returns {Array} normalised event objects
 */
async function fetchTicketmasterEvents(genreId = "KnvZfZ7v7l1", keyword = "") {
  const today = new Date().toISOString().split(".")[0] + "Z";

  const response = await ticketmasterClient.get("events", {
    params: {
      countryCode:   "IE",
      genreId,
      keyword,
      startDateTime: today,
      sort:          "date,asc",
      size:          10,
    },
  });

  const rawEvents = response.data?._embedded?.events || [];

  // Normalise to a consistent shape
  return rawEvents.map((e) => ({
    title:     e.name,
    date:      e.dates?.start?.localDate || null,
    venue:     e._embedded?.venues?.[0]?.name || null,
    eventUrl:  e.url || null,
    posterUrl: e.images?.[0]?.url || null,
    source:    "Ticketmaster",
  }));
}

/**
 * Fetch films currently showing in Irish cinemas from TMDB.
 * @returns {Array} normalised event objects
 */
async function fetchNowShowingFilms() {
  const response = await tmdbClient.get("/movie/now_playing", {
    params: { region: "IE", language: "en-IE" },
  });

  const films = response.data?.results || [];

  return films.slice(0, 10).map((film) => ({
    title:     film.title,
    date:      film.release_date || null,
    venue:     "Various Dublin Cinemas",
    eventUrl:  `https://entertainment.ie/cinema/cinema-listings/dublin/all-venues/${encodeURIComponent(film.title)}`,
    posterUrl: film.poster_path
      ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
      : null,
    source:    "TMDB",
  }));
}

module.exports = { fetchTicketmasterEvents, fetchNowShowingFilms };