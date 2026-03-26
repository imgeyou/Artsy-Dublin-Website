const express = require("express");
const cors = require("cors");
const path = require("path");
const fileUpload = require('express-fileupload');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));//static path

// must be before routes so req.files is available in controllers
app.use(fileUpload({                                
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true,
    responseOnLimit: "File size exceeds the 5MB limit."
})
);

const eventsRoute = require("./routes/events");
app.use("/api/events", eventsRoute);

const usersRoute = require("./routes/users")
app.use("/api/users", usersRoute);

const postsRoute = require("./routes/posts")
app.use("/api/posts", postsRoute);

app.listen(3005, () => {
    console.log("Server running on http://localhost:3005")
} )
