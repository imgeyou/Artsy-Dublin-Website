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
    const [results] = await pool.query(`SELECT * FROM ${dotenv.parsed.EVENTS_TABLE}`);
    return results;
}

// Make API connection
const ticketmaster_api = axios.create({
    baseURL: 'https://app.ticketmaster.com/discovery/v2/',
    params: {
        apikey: process.env.Ticketmaster_API_KEY
    }
});

async function fetchAndPopulate(eventType) {
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
            // dateTime: e.dates.start.dateTime,
            dateTime: new Date(e.dates.start.dateTime).toISOString().slice(0, 19).replace('T', ' '),
            venue: e._embedded.venues[0].name,
            genres: [e.classifications[0].genre.id, e.classifications[0].subGenre.id]
        })
    );

    // populate into db, skipping repeats appropriately
    for (let event of eventsData) {
        const eventInDb = await getEventByTitle(event.title);
        if (eventInDb) {
            // if this event already exists in table, add it to repeats table
            // console.log(eventInDb.eventId, eventInDb.title + ' already exists');
            console.log(event.dateTime)
            await pool.query(
                `INSERT INTO eventsrepeats 
                (eventId, date) 
                VALUES (?, ?)`, 
                [eventInDb.eventId, event.dateTime]
            );
        } else {
            // new event, add to events table
            const [result] = await pool.query(
                `INSERT IGNORE INTO ${dotenv.parsed.EVENTS_TABLE} 
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
                (eventId, genreId) 
                VALUES (?, ?)`, 
                [eventId, eventGenre]
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

async function getEventByTitle(title) {
    const [results] = await pool.query(
        `SELECT * FROM events WHERE title = ?`,
        [title]
    );
    return results[0] || null;
}

module.exports = {
    get,
    fetchAndPopulate,
    getEventById
};