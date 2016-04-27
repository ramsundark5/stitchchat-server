"use strict";

var express = require('express');
var AuthService = require('./services/AuthenticationService');
var PushNotificationService  = require('./services/PushNotificationService');
var app = express();
var AWS = require('aws-sdk');
var logger = require('./config/LoggerConfig');
var uuid = require('node-uuid');
require('dotenv').config();

class Routes{

    constructor(){
        app.get('/authenticate', this.authenticate);
        app.get('/attachments', this.getPresignedUrl);
        app.get('/attachments/:attachmentId', this.getPresignedAttachmentUrl);
        this.init();
    }

    authenticate(req, res){
        var reqHeaders = req.headers;
        var providerUrl = reqHeaders['x-auth-service-provider'];
        var authHeader  = reqHeaders['x-verify-credentials-authorization'];
        var userSentPhoneNumber = reqHeaders['phonenumber'];
        let authPromise = AuthService.authenticate(providerUrl, authHeader, userSentPhoneNumber);
        authPromise
            .then(function(token){
                res.status(200).json({ token: token });
            })
            .catch(function(error){
                logger.error("error authenticating user"+error);
                res.status(401).json({ error: 'not authorized' });
            });
    }

    getPresignedUrl(req, res){
        var s3 = new AWS.S3();
        var attachmentId = uuid.v4();
        var fileExtension = req.query.ext;
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
                res.status(500).json({ error: 'error getting pre-signed url' });
            }
        });
    }

    getPresignedAttachmentUrl(req, res){
        var s3 = new AWS.S3();
        var attachmentId = req.params.attachmentId;
        var params = {Bucket: 'incogattachments', Key: attachmentId};
        s3.getSignedUrl('getObject', params, function (err, url) {
            if(url){
                logger.log("The attachment URL is", url);
                res.json({ url: url, attachmentId: attachmentId })
            }
            if(err){
                logger.error("error getting pre-signed attachment url"+err);
                res.status(500).json({ error: 'error getting pre-signed attachment url' });
            }
        });
    }

    init(){
        var server = app.listen(process.env.PORT || 3000, function () {
            var port = server.address().port;
            PushNotificationService.initQueueHandler();
            logger.debug('stitchchat-register listening at port ' + port);

        });
    }

}

module.exports = new Routes();