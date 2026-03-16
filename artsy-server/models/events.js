// this is where we handle all raw data relating to events, e.g. from api and/or db

const path = require('path');
const dotenv = require('dotenv').config({path: path.join(__dirname, '..', '.env')});
const axios = require('axios');

// use mysql2 pool instead of node-querybuilder bc its very buggy with insert ignore into etc..
const mysql2 = require("mysql2");
// still one pool shared across all methods. not recreated per request
const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
}).promise();

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

async function fetchAndPopulate() {
    // fetch events from api
    const theatreEvents = await ticketmaster_api.get('events', {
        params: {
        countryCode: 'IE',
        genreId: 'KnvZfZ7v7l1', // theatre
        keyword: 'comedy', // comedy, musical etc.
        startDateTime: '2026-05-10T19:00:00Z', // get user's current date and set end to a month later
        sort: 'date,asc'
        }
    });
    let eventsData = theatreEvents.data._embedded.events.map((e) => ({
        name: e.name,
        url: e.url,
    }));

    // populate into db, skipping repeats
    for (let event of eventsData) {
        await pool.query(
            `INSERT IGNORE INTO ${dotenv.parsed.EVENTS_TABLE} (name, url) VALUES (?, ?)`,
            [event.name, event.url]
        );
    }
    return eventsData;
}

//get event details by its id
async function getEventById(eventId) {
    const [results] = await pool.query(
        `SELECT * FROM events WHERE eventId = ?`,
        [eventId]
    );
    return results[0] || null;
}

module.exports = {
    get,
    fetchAndPopulate,
    getEventById
};