// this is where we handle all raw data relating to events, e.g. from api and/or db

const path = require('path');
const dotenv = require('dotenv').config({path: path.join(__dirname, '..', '.env')});
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
    const response = await tmdb_api.get('/discover/movie', {
    params: {
        region: 'IE',
        'release_date.gte': '2026-03-15',
        'release_date.lte': '2026-03-25',
        'with_release_type': '2|3' // theater code
    }
    });

    response.data.results.map((film) => console.log(film.title + " was released this month. \n See all showtimes near you here: https://entertainment.ie/cinema/cinema-listings/dublin/all-venues/"+film.title.replace("'", "").replace(/\s/g, "-")));
    // potentially add web scraping of ent.ie/cinema-listings
    
    return response.data.results;
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
        console.log(event.dateTime)
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