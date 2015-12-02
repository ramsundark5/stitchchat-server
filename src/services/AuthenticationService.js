"use strict";

var request = require('superagent-bluebird-promise');
var logger  = require('../config/LoggerConfig');
var User    = require('../models/User');
var jwt     = require('jsonwebtoken');
var UserDao = require('../dao/UserDao');

class AuthService{

    registerUser(providerUrl, authHeaders){
        let verifyTokenRequestPromise = this.verifyTokenRequest(providerUrl, authHeaders);

        return verifyTokenRequestPromise
            .then(this.addUserToDB);
    }

    authenticate(providerUrl, authHeaders, userSentPhoneNumber){
        let verifyTokenRequestPromise = this.verifyTokenRequest(providerUrl, authHeaders);

        return verifyTokenRequestPromise
            .then(this.confirmUserIdentity.bind(null, userSentPhoneNumber));
    }

    verifyTokenRequest(providerUrl, authHeaders){
        let verifyTokenRequest = request
            .get(providerUrl)
            .set('Authorization', authHeaders)
            .set('Content-Type', 'application/json')
            .promise();
        return verifyTokenRequest;
    }

    confirmUserIdentity(userSentPhoneNumber, serverResponse){
        logger.log("phone number is "+serverResponse.body.phone_number);
        let serverVerifiedPhoneNumber = serverResponse.body.phone_number;
        if(serverVerifiedPhoneNumber && serverVerifiedPhoneNumber == userSentPhoneNumber){
            return serverVerifiedPhoneNumber;
        }
        return null;
    }

    addUserToDB(serverResponse){
        let serverVerifiedPhoneNumber = serverResponse.body.phone_number;
        if(!serverVerifiedPhoneNumber){
            return null;
        }
        let newUser = new User(serverVerifiedPhoneNumber);
        UserDao.addUser(serverVerifiedPhoneNumber, newUser);
        return newUser;
    }

}

module.exports = new AuthService();