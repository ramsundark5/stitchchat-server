"use strict";

var express = require('express');
var AuthService = require('./AuthenticationService');
var app = express();
var AWS = require('aws-sdk');
var logger = require('../config/LoggerConfig');
var uuid = require('node-uuid');

class RegistrationService{

    constructor(){
        app.get('/register', this.registerNewUser);
        app.get('/attachments', this.getPresignedUrl);
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

    getPresignedUrl(req, res){
        var s3AccessKey = process.env.S3_ACCESS_KEY;
        var s3 = new AWS.S3();
        var attachmentId = uuid.v4();
        var fileExtension = req.query('ext');
        if(fileExtension){
            attachmentId = attachmentId + "." + fileExtension;
        }
        var params = {Bucket: 'incogattachments', Key: attachmentId, ContentType: 'multipart/form-data'};
        s3.getSignedUrl('putObject', params, function (err, url) {
            if(url){
                logger.log("The URL is", url);
                res.json({ url: url, attachmentId: attachmentId })
            }
            if(err){
                logger.error("error getting pre-signed url"+err);
            }
        });
    }
}

module.exports = new RegistrationService();