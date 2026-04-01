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
    origin: ["http://localhost:5173", "http://127.0.0.1:5500"],
  }),
);
app.use(express.json());

const genresRouter = require("./routes/genres");
app.use("/genres", genresRouter);

const eventsRoute = require("./routes/events");
app.use("/events", eventsRoute);

const usersRoute = require("./routes/users");
app.use("/users", usersRoute);

const authRoute = require("./routes/auth");
app.use("/api", authRoute);

//the images user used can be visit public
app.use("/uploads", express.static("uploads"));

app.listen(3005, () => {
  console.log("Server running on http://localhost:3005");
});
