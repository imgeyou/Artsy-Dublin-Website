const axios = require('axios');
require('dotenv').config();

const ticketmaster_api = axios.create({
  baseURL: 'https://app.ticketmaster.com/discovery/v2/',
  params: {
    apikey: process.env.Ticketmaster_API_KEY 
  }
});

async function searchTheatreEvents() {
  const eventRes = await ticketmaster_api.get('events', {
    params: {
      // specify dublin
      countryCode: 'IE',
      genreId: 'KnvZfZ7v7l1', // theatre
      keyword: 'comedy', // comedy, musical etc.
      startDateTime: '2026-05-10T19:00:00Z', // get user's current date and set end to a month later
      sort: 'date,asc'
    }
  });

  // const venueRes = await ticketmaster_api.get('events', {
  //   params: {
  //     id: 'KovZ917AZa7'
  //   }
  // });
  console.log("Link to theatre event near you: " + eventRes.data._embedded.events[0].url);
  console.log("Link to event venue: " + eventRes.data._embedded.events[0]._embedded.venues[0].url); 
  // use long/lat to show googlemaps instead of ticketmaster URL
  return eventRes.data;
}

const tmdb_api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    'Authorization': `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function searchShowingFilms() {
  const response = await tmdb_api.get('/discover/movie', {
    params: {
      region: 'IE',
      'release_date.gte': '2026-01-01',
      'release_date.lte': '2026-02-10',
      'with_release_type': '2|3' // theater code
    }
  });
  console.log(response.data.results[0].title + " is currently showing.")
  console.log("See all showtimes near you here: " + "https://entertainment.ie/cinema/cinema-listings/dublin/all-venues/"+response.data.results[0].title);
  return response.data;
}

// TODO: ADD DESCRIPTION, PRICE, END DATE (FOR OPTIMIZING DATABASE)
// CONNECT TO DATABASE

searchShowingFilms();
searchTheatreEvents();