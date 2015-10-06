"use strict";

var request = require('superagent-bluebird-promise');
var logger  = require('../config/LoggerConfig');
var User    = require('../models/User');
var jwt     = require('jsonwebtoken');

class AuthService{

    registerUser(providerUrl, authHeaders, userSentPhoneNumber){
        let verifyTokenRequest = request
            .get(providerUrl)
            .set('Authorization', authHeaders)
            .set('Content-Type', 'application/json')
            .promise();

        return verifyTokenRequest
            .then(this.confirmUserIdentity.bind(null, userSentPhoneNumber))
            .then(this.addUserToDB)
            .then(this.generateJWTToken);
    }

    confirmUserIdentity(userSentPhoneNumber, serverResponse){
        logger.log("phone number is "+serverResponse.body.phone_number);
        let serverVerifiedPhoneNumber = serverResponse.body.phone_number;
        if(serverVerifiedPhoneNumber == userSentPhoneNumber){
            let newUser = new User(serverVerifiedPhoneNumber);
            return newUser;
        }
        return null;
    }

    addUserToDB(newUser){
        if(!newUser){
            return null;
        }
        return newUser;
    }

    generateJWTToken(newUser){
        if(!newUser){
            return null;
        }
        let tokenObj = { phoneNumber: newUser.id };
        let token = jwt.sign(tokenObj, 'stitchpassword');
        logger.debug("jwt token is "+ token);
        return token;
    }
}

module.exports = new AuthService();