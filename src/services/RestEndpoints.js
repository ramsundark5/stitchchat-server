"use strict";

var express = require('express');
var AuthService = require('./AuthenticationService');
var app = express();
var logger = require('../config/LoggerConfig');

class RegistrationService{

    constructor(){
        app.get('/register', this.registerNewUser);
    }

    init(){
        var server = app.listen(3000, function () {
            var port = server.address().port;

            logger.debug('stitchchat-register listening at port ' + port);
        });
    }
    registerNewUser(req, res){
        var reqHeaders = req.headers;
        var providerUrl = reqHeaders['x-auth-service-provider'];
        var authHeader  = reqHeaders['x-verify-credentials-authorization'];
        var userSentPhoneNumber = reqHeaders['phonenumber'];
        let registrationPromise = AuthService.registerUser(providerUrl, authHeader, userSentPhoneNumber);
        registrationPromise
            .then(function(token){
                res.json({ jwt: token })

            })
            .catch(function(error){
                logger.error("error registering user"+error);
                res.status(401).json({ error: 'not authorized' })
            });

    }
}

module.exports = new RegistrationService();