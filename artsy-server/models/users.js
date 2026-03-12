// this is where we handle all raw data relating to users from db

const path = require('path');
const dotenv = require('dotenv').config({path: path.join(__dirname, '..', '.env')});
const axios = require('axios');

// Import mysql and configure file
const dbconfig = require("../utils/dbconfig");
const mysql = require("mysql2/promise");

// userModel defines all the functions we need to use related to users
class usersModel{
    
    //get all the users
    async getUsersPool(){
        // Connect to the database
        const connection = await mysql.createConnection(dbconfig);

        let que;//mysql query
        try{
            que = "select * from users;";
            const [results, fields] = await connection.query(que);
            return results;
        }
        catch(err){
            console.error("Query Error: " + err);
        }finally{
            connection.end();}
    }

    //get user profile info by their username
    async getUsersByName(name){
        // Connect to the database
        const connection = await mysql.createConnection(dbconfig);
        try{
            const que = 
            `select users.*, userLocation.locationName, userGender.genderName
            from users 
            join userLocation on users.location = userLocation.locationId
            join userGender on users.gender = userGender.genderId
            where username =?`;
            const [results, fields] = await connection.query(que, [name]);
            return results[0]||null;
        }
        catch(err){
            console.error("Query Error: " + err);
        }
        finally{connection.end();
        }
        
    }
}


module.exports = new usersModel();