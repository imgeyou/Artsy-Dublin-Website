// this is the controller for user related stuff

const usersModel = require('../models/users');

class userController{
    //fetch all users
    async getUserByName(req, res){
        const userProfile   = await usersModel.getUsersByName(req.params.username);
        if(!userProfile)return res
            .status(404)
            .send('user not found');
        //console.log(userProfile);
        res.json(userProfile);
     }
    //fetch single user profile information
    async getUsersPool(req, res){
        const usersPool   = await usersModel.getUsersPool();
        if(!usersPool)return res
            .status(404)
            .send('user not found');
        //console.log(usersPool);
        res.json(usersPool);
     }

    }

module.exports = new userController();