//This is the configure file for setting up database connection
require('dotenv').config();

module.exports = {
    host: process.env.DB_HOST,//host
    database: process.env.DB_NAME,//db name
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,    
}