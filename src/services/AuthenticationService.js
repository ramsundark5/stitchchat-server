"use strict";

var request = require('superagent-bluebird-promise');
var logger  = require('../config/LoggerConfig');
var FirebaseTokenGenerator = require("firebase-token-generator");
var uuid = require('node-uuid');

class AuthService{

    authenticate(providerUrl, authHeaders, userSentPhoneNumber){
        let verifyTokenRequestPromise = this.verifyTokenRequest(providerUrl, authHeaders);

        return verifyTokenRequestPromise
            .then(this.confirmUserIdentity.bind(null, userSentPhoneNumber))
            .then(this.generateJWTToken);
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

    generateJWTToken(phoneNumber){
        if(!phoneNumber){
            return null;
        }
        var tokenGenerator = new FirebaseTokenGenerator(process.env.FIREBASE_ACCESS_KEY);
        var uniqueId = uuid.v4();
        var token = tokenGenerator.createToken({ uid: uniqueId});
        return token;
    }
}

module.exports = new AuthService();