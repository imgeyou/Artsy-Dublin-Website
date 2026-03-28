// this is where we handle all raw data relating to events, e.g. from api and/or db

const path = require('path');
const { default: slugify } = require("slugify");
const axios = require('axios');

// use mysql2 pool instead of node-querybuilder bc its very buggy with insert ignore into etc..
const dbconfig = require("../utils/dbconfig");
const mysql2 = require("mysql2");
// still one pool shared across all methods. not recreated per request
const pool = mysql2.createPool(dbconfig).promise();

// get all events
async function get() {
    const [results] = await pool.query(`SELECT * FROM events`);
    return results;
}

// Make API connections
const ticketmaster_api = axios.create({
    baseURL: 'https://app.ticketmaster.com/discovery/v2/',
    params: {
        apikey: process.env.Ticketmaster_API_KEY
    }
});

const tmdb_api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    'Authorization': `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function fetchFilmsAndPopulate() {
   const films = await tmdb_api.get('/movie/now_playing', {
    params: {
        region: 'IE',
        language: 'en-IE'
    }
    });

    // films.data.results.map((film) => 
    //     console.log(film.title + ` was released this month. \n See all showtimes near you here:` +  
    //         `https://www.google.com/search?q=${film.title.replace("'", "").replace(/\s/g, "+")}+showtimes+Dublin`));
    
    // potentially add web scraping of ent.ie/cinema-listings

    // clean up the API response by getting data we need
    let filmsData = films.data.results.map((film) => 
    ({
        title: film.original_title!==film.title ? `${film.title} (${film.original_title})` : film.title,
        desc: film.overview,
        url: `https://cinematimes.ie/dublin/movies/${slugify(film.title, { lower: true, strict: true })}`,
        posterUrl: `https://image.tmdb.org/t/p/original/${film.poster_path }`,
        genres: film.genre_ids
    }))

    for (let film of filmsData) {
        // only add film if it isn't already in events table. not accomodating for repeats since we can't store showtimes.
        const eventInDb = await getEventByTitle(film.title);
        if (!eventInDb) {
            const [result] = await pool.query(
                `INSERT IGNORE INTO events 
                (title, url, description, 
                posterURL, eventTypeId) 
                VALUES (?, ?, ?, ?, ?)`, 
                [film.title, film.url, film.desc, film.posterUrl, "tmdbFilm"]
            );

            // get PK generated above to store in event tags table
            const eventId = result.insertId;
            
            // loop thru current film's genres and add each genre to eventTags junction table for future look-up
            for (let eventGenre of film.genres) {
                await pool.query(
                `INSERT IGNORE INTO eventtags
                (eventTagsId, eventId, genreId) 
                VALUES (?, ?, ?)`, 
                [eventId+"-"+eventGenre, eventId, eventGenre]
            );
            }
        }
    }
    
    return filmsData;
}

async function fetchLiveEventsAndPopulate(eventType) {
    // fetch events from api
    // TODO: error detection for incorrect eventType
    const theatreEvents = await ticketmaster_api.get('events', {
        params: {
            countryCode: 'IE',
            segmentId: eventType, // e.g. KZFzniwnSyZfZ7v7na - arts & theater
            startDateTime: '2026-05-10T19:00:00Z', // get user's current date and set end to a month later
            sort: 'date,asc'
        }
    });

    // clean up data by producing an obj with all the data we need for our db
    let eventsData = theatreEvents.data._embedded.events.map((e) =>  
        ({
            title: e.name,
            url: e.url,
            desc: `${e.classifications[0].segment.name}, ${e.classifications[0].subGenre.name}`, 
            posterUrl: e.images[0].url,
            dateTime: e.dates.start.dateTime,
            // dateTime: new Date(e.dates.start.dateTime).toISOString().slice(0, 19).replace('T', ' '),
            venue: e._embedded.venues[0].name,
            genres: [e.classifications[0].genre.id, e.classifications[0].subGenre.id]
        })
    );

    // populate into db, skipping repeats appropriately
    for (let event of eventsData) {
        const eventInDb = await getEventByTitle(event.title);
        if (eventInDb) {
            // if this event already exists in table, add it to repeats table
            await pool.query(
                `INSERT IGNORE INTO eventsrepeats 
                (eventId, date) 
                VALUES (?, ?)`, 
                [eventInDb.eventId, event.dateTime]
            );
        } else {
            // new event, add to events table
            const [result] = await pool.query(
                `INSERT IGNORE INTO events 
                (title, url, description, 
                posterURL, startDateTime, 
                venue, eventTypeId) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                [event.title, event.url, event.desc, 
                event.posterUrl, event.dateTime,
                event.venue,
                eventType]
            );

            // get PK generated above to store in event tags table
            const eventId = result.insertId;
            
            // loop thru current event's genres and add each genre to eventTags junction table for future look-up
            for (let eventGenre of event.genres) {
                await pool.query(
                `INSERT IGNORE INTO eventtags
                (eventTagsId, eventId, genreId) 
                VALUES (?, ?, ?)`, 
                [eventId+"-"+eventGenre, eventId, eventGenre]
            );
            }
        }
    }
    return eventsData;
}

// get event details by its id
async function getEventById(eventId) {
    const [results] = await pool.query(
        `SELECT * FROM events WHERE eventId = ?`,
        [eventId]
    );
    return results[0] || null;
}

// get event repeats
// get event details by its id
async function getEventRepeatsById(eventId) {
    const [results] = await pool.query(
        `SELECT * FROM events WHERE eventId = ?`,
        [eventId]
    );

    // get any repeats of the event
    results.push(await pool.query(
        `SELECT * FROM eventsrepeats WHERE eventId = ?`,
        [eventId]
    ));

    return results || null;
}

async function getEventByTitle(title) {
    const [results] = await pool.query(
        `SELECT * FROM events WHERE title = ?`,
        [title]
    );
    return results[0] || null;
}

module.exports = {
    get,
    fetchLiveEventsAndPopulate,
    fetchFilmsAndPopulate,
    getEventById,
    getEventRepeatsById
};