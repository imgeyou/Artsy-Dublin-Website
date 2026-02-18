const axios = require('axios');
require('dotenv').config();

const ticketmaster_api = axios.create({
  baseURL: 'https://app.ticketmaster.com/discovery/v2/',
  params: {
    apikey: process.env.Ticketmaster_API_KEY 
  }
});

// TODO: 
  // ADD DESCRIPTION, PRICE -- cant do these for this event
  // END DATE (FOR OPTIMIZING DATABASE) -- n/a for MVP
  // use long/lat to show googlemaps
  // CONNECT TO DATABASE

async function searchTheatreEvents() {
  const theatreEvents = await ticketmaster_api.get('events', {
    params: {
      countryCode: 'IE', // can't specify dublin
      genreId: 'KnvZfZ7v7l1', // theatre
      keyword: 'comedy', // comedy, musical etc.
      startDateTime: '2026-05-10T19:00:00Z', // get user's current date and set end to a month later
      sort: 'date,asc'
    }
  });

  // get the id of the first event returned from API
  let id = theatreEvents.data._embedded.events[0].id;

  // get the details of that event via another API call
  const eventData = await ticketmaster_api.get(`events/${id}`);

  let linkToEvent = eventData.data.url;
  let linkToVenueOnTm = eventData.data._embedded.venues[0].url;
  let venueLong = eventData.data._embedded.venues[0].location.longitude; 
  let venueLat = eventData.data._embedded.venues[0].location.latitude;

  console.log("Link to theatre event near you: " + linkToEvent);
  console.log("Link to event venue: " + linkToVenueOnTm); 
  console.log(venueLat, venueLong);

  return theatreEvents.data;
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

// searchShowingFilms();
searchTheatreEvents();