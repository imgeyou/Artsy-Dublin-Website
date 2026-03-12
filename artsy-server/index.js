const express = require("express");

const app = express();

const eventsRoute = require("./routes/events");
app.use("/events", eventsRoute);

const usersRoute = require("./routes/users")
app.use("/users", usersRoute);

app.listen(3005, () => {
    console.log("Server running on http://localhost:3005")
} )