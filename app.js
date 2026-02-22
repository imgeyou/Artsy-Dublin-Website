require("dotenv").config();

const express = require("express");
const path    = require("path");
const cors    = require("cors");
const routes  = require("./routes/routes");

const app  = express();
const PORT = process.env.PORT || 8085;

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).render("pages/home", { 
    title: "Page Not Found", 
    error: "That page does not exist." 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).send("Something went wrong. Please try again.");
});

app.listen(PORT, () => {
  console.log(`Artsy Dublin running at http://localhost:${PORT}`);
});