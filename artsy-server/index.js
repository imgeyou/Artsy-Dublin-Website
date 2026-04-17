const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const app = express();
const server = http.createServer(app);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5500"],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

const genresRouter = require("./routes/genres");
app.use("/genres", genresRouter);

const eventsRoute = require("./routes/events");
app.use("/events", eventsRoute);

const usersRoute = require("./routes/users");
app.use("/users", usersRoute);

const authRoute = require("./routes/auth");
app.use("/ad-auth", authRoute);

const messagesRoute = require("./routes/messages");
app.use("/ad-messages", messagesRoute);

// Static uploads served from public/uploads
app.use("/uploads", express.static("public/uploads"));

// Register all socket io event handlers
const registerSocketHandlers = require("./sockets/messaging");
registerSocketHandlers(io);

server.listen(3005, () => {
  console.log("Server running on http://localhost:3005");
});
