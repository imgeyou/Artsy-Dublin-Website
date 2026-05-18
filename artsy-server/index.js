const express = require('express');
const morgan = require('morgan');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require('http');
const cron = require('node-cron');
const { Server } = require('socket.io');
const path = require("path");
const fileUpload = require('express-fileupload');
const registerSocketHandlers = require('./sockets/messaging');

const app = express();
const server = http.createServer(app); // for socket
const hostname = 'localhost';
const port = 3005;

// Use Morgan for logging HTTP requests
app.use(morgan('dev'));

// Helps the app read JSON data sent from the client
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"))); //static path

// must be before routes so req.files is available in controllers
app.use(fileUpload({                                
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true,
    responseOnLimit: "File size exceeds the 5MB limit."
})
);

// Frontend proxy
app.use(cors({
  origin: ["https://artsy-dublin.vercel.app", "http://localhost:5173"],
  credentials: true,
}));

// Establishing routes

const genresRouter = require("./routes/genres");
app.use("/ad-genres", genresRouter);

const eventsRoute = require("./routes/events");
app.use("/ad-events", eventsRoute);

// Monthly automated event update
const eventsModel = require("./models/events"); 
cron.schedule('0 0 1 */1 *', async () => { 
    console.log('It is the first day of the month. Updating events.');
    try {
      await eventsModel.fetchFilmsAndPopulate();
      await eventsModel.fetchLiveEventsAndPopulate("Music");
      await eventsModel.fetchLiveEventsAndPopulate("Arts-&-Theater");
    }
    catch (error) {
      console.error('Task failed:', error);
    }
});

const usersRoute = require("./routes/users")
app.use("/ad-users", usersRoute);

const authRoute = require("./routes/auth");
app.use("/ad-auth", authRoute);

const postsRoute = require("./routes/posts")
app.use("/ad-posts", postsRoute);

//the images user used can be visit public
app.use("/ad-uploads", express.static("public/uploads"));

// WIP
const messagesRoute = require("./routes/messages");
app.use("/ad-messages", messagesRoute);

// Attach Socket.IO to the http server, then register handlers
const io = new Server(server, {
  cors: {
    origin: ["https://artsy-dublin.vercel.app", "http://localhost:5173"],
    credentials: true,
  }
});
registerSocketHandlers(io);  

// Start the server
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

