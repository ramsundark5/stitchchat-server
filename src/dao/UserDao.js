"use strict";
var logger = require('../config/LoggerConfig');
var DBHelper = require('./DBHelper');

class UserDao{
    constructor(){
        let db          = DBHelper.getDB();
        this.userTable  = db.sublevel("users");
    }

    addUser(phoneNumber, newUser){
        let userJson = JSON.stringify(newUser);
        this.userTable.put(phoneNumber, userJson, function(err){
            logger.log("user added to db "+err);
        });
    }

    getUser(phoneNumber, cb){
        this.userTable.get(phoneNumber, function(err, userJson) {
            if(userJson){
                let userObj = JSON.parse(userJson);
                return cb(err, userObj);
            }
            return cb(err, userJson);
        });
    }
}
module.exports = new UserDao();