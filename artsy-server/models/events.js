// this is where we handle all raw data relating to events, e.g. from api and/or db

const path = require('path');
const dotenv = require('dotenv').config({path: path.join(__dirname, '..', '.env')});
const axios = require('axios');

//import node-querybuilder and configure file
const dbconfig = require("../utils/dbconfig");
const queryBuilder = require("node-querybuilder");

// one pool shared across all methods. never recreated per request
const pool = new queryBuilder(dbconfig, "mysql", "pool");


// Make mysql connection
const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',     
    user: 'root',          
    password: dotenv.parsed.DB_PASSWORD,          
    database: dotenv.parsed.DB_NAME     
});

// Connect to the database
connection.connect(error => {
    if (error) {
    console.error('Error connecting to the database:', error);
    return;
    }
    console.log('Connected to the database');
});

// Get all events - promise to await response
function get() {
    return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM ${dotenv.parsed.EVENTS_TABLE};`, (error, results) => {
        if (error) {
            reject(error);
            return;
        }
        console.log(results);
        resolve(results);
    });
    });
}

// make api call
// add to db

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

    // theatreEvents.data._embedded.events[0].id
    let eventsData = theatreEvents.data._embedded.events.map((e) => (
        {
            name: e.name,
            url: e.url,
        }
    ));

    // populate into db, skipping repeats
    connection.connect(function(err) {
        if (err) throw err;
        for (let event of eventsData) {
            let sql = `INSERT IGNORE INTO ${dotenv.parsed.EVENTS_TABLE} (name, url) VALUES (?, ?)`;
            connection.query(sql, [event.name, event.url], (err) => {
                if (err) throw err;
            });
        }
    });
    
    return eventsData;
}

// TESTING PURPOSES - 'nodemon /models/events.js'
async function asyncCall() {
    const results = await fetchAndPopulate();
    console.log(results);
    return results;
}
// asyncCall(); //-- uncomment for above testing

//get event details by its id
async function getEventById(eventId) {
    // Connect to the database
    let que;//mysql query
    try{
        que = await pool.get_connection();
        const results = await que
        .select('*')
        .where('events.eventId', eventId)
        .get('events');
        return results[0] || null;
    }
    catch(err){
        console.error("Query Error: " + err);
    }
    finally{
        if (que) que.release();
    }
}

module.exports = {
    get,
    fetchAndPopulate,
    getEventById
};
