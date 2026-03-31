// this is the controller for event related stuff
// TODO: const userId = req.session?.userId

const model = require("../models/events");
const postsModel = require("../models/posts");

// these also have to be async functions because we need to await the return from mysql!
// which in turn awaits the call from the api (model side)

async function get (req, res) {
    // fetch all events from the db!! what's already stored in there!!
    const results = await model.get();
    res.json(results);
}

async function getEventsByType(req, res) {
    const eventType = req.params.typename;
    let results = await model.getEventsByType(eventType);
    if (!results)
        return res.status(404).send("That event type does not exist. Try: 'Arts-&-Theater', 'Music', 'Film-Showing'");
    res.json(results);
}

async function updateByType (req, res) {
    const eventType = req.params.typename;
    // update events, do an API call to populate the db!
    let results;
    if (eventType == 'Film-Showing')
        results = await model.fetchFilmsAndPopulate();
    else
        results = await model.fetchLiveEventsAndPopulate(eventType);
    if (!results)
        return res.status(404).send("That event type does not exist. Try: 'Arts-&-Theater', 'Music', 'Film-Showing'");
    // then call all events from the db
    // const results = await model.get();
    res.json(results); // like this, it returns the result of that fetch, not the entirety of the updated database.
}

async function getEventsByGenre(req, res) {
    const genreName = req.params.genrename;
    const results = await model.getEventsByGenre(genreName);
    if (!results)
        return res.status(404).send("That event genre does not exist. Try: 'Rock', 'Theatre', etc.");
    else if (results.length == [])
        return res.status(404).send("No events in database for that genre. Try to do an update first.");;
    res.json(results); 
}

async function getEventById (req, res) {
    const id = req.params.eventid;
    const eventDetail = await model.getEventById(id);
    if(!eventDetail) return res.status(404).send('Event not found');

    const eventRepeats = await model.getEventRepeatsById(id);

    const userId = 1; // TODO: const userId = req.session?.userId
    const attendance = userId
        ? await postsModel.getAttendanceStatus(userId, id)
        : null;

    res.json({ ...eventDetail, eventRepeats, attendance }); // attendance: null if not logged in / not attended, otherwise { eventAttendId, rating }
}

module.exports = {
    get,
    updateByType,
    getEventById,
    getEventsByType,
    getEventsByGenre
};