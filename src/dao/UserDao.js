"use strict";
var logger = require('../config/LoggerConfig');
var DBHelper = require('./DBHelper');

class UserDao{
    constructor(){
        this.db = DBHelper.getDB();
    }

    addUser(phoneNumber, newUser){
        let userJson = JSON.stringify(newUser);
        this.db.put(phoneNumber, userJson, function(err){
            logger.log("user added to db "+err);
        });
    }

    getUser(phoneNumber, cb){
        this.db.get(phoneNumber, function(err, userJson) {
            if(userJson){
                let userObj = JSON.parse(userJson);
                return cb(err, userObj);
            }
            return cb(err, userJson);
        });
    }
}
module.exports = new UserDao();