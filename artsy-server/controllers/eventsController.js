// this is the controller for event related stuff

const model = require("../models/events");

// these also have to be async functions because we need to await the return from mysql!
// which in turn awaits the call from the api (model side)

async function get (req, res) {
    // fetch all events from the db!! what's already stored in there!!
    const results = await model.get();
    res.json(results);
}

async function update (req, res) {
    // update events, do an API call to populate the db!
    await model.fetchAndPopulate();
    // then call all events from the db
    const results = await model.get();
    res.json(results);
}

module.exports = {
    get,
    update
};