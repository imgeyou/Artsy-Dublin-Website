//This is the configure file for setting up database connection
require("dotenv").config();

module.exports = {
  host: process.env.DBHOST,
  port: process.env.DBPORT,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  }
};