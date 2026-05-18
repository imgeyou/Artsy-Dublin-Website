//This is the configure file for setting up database connection
require("dotenv").config();

module.exports = {
  host: DBHOST,
  port: DBPORT,
  user: DBUSER,
  password: DBPASS,
  database: DBNAME,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  }
};