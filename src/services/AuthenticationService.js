"use strict";

var request = require('superagent-bluebird-promise');
var logger  = require('../config/LoggerConfig');
var jwt     = require('jsonwebtoken');

class AuthService{

    authenticate(providerUrl, authHeaders, userSentPhoneNumber){
        let verifyTokenRequestPromise = this.verifyTokenRequest(providerUrl, authHeaders);

        return verifyTokenRequestPromise
            .then(this.confirmUserIdentity.bind(null, userSentPhoneNumber))
            .then(this.generateJWTToken);;
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
        let tokenObj = { phoneNumber: phoneNumber };
        let token = jwt.sign(tokenObj, 'stitchpassword');
        logger.debug("jwt token is "+ token);
        return token;
    }
}

module.exports = new AuthService();