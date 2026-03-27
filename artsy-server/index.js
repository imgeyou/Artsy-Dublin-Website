const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());

const eventsRoute = require("./routes/events");
app.use("/events", eventsRoute);

const usersRoute = require("./routes/users");
app.use("/users", usersRoute);

app.listen(3005, () => {
  console.log("Server running on http://localhost:3005");
});
