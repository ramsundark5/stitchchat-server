"use strict";

var express = require('express');
var AuthService = require('./services/AuthService');
var app = express();
var logger = require('./config/LoggerConfig');

app.get('/register', function(req, res){
    var reqHeaders = req.headers;
    var providerUrl = reqHeaders['x-auth-service-provider'];
    var authHeader  = reqHeaders['x-verify-credentials-authorization'];
    var userSentPhoneNumber = reqHeaders['phonenumber'];
    let registrationPromise = AuthService.registerUser(providerUrl, authHeader, userSentPhoneNumber);
    registrationPromise
        .then(function(token){
            logger.debug("got jwt token as "+ token);
            res.send(token);
        })
        .catch(function(error){
            logger.error("error registering user"+error);
            res.send("error");
        });

});


app.listen(3000);