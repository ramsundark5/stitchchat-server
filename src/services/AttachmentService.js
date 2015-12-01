"use strict";

var AWS = require('aws-sdk');
var logger = require('../config/LoggerConfig');
var uuid = require('node-uuid');

class AttachmentService{

    getPresignedUrl(successCallback, errorCallback, fileExtension){
        var s3AccessKey = process.env.S3_ACCESS_KEY;
        var s3 = new AWS.S3();
        var attachmentId = uuid.v1();
        if(fileExtension){
            attachmentId = attachmentId + "." + fileExtension;
        }
        var params = {Bucket: 'incogattachments', Key: attachmentId, ContentType: 'multipart/form-data'};
        s3.getSignedUrl('putObject', params, function (err, url) {
            if(url){
                logger.log("The URL is", url);
                successCallback({ url: url, attachmentId: attachmentId });
            }
            if(err){
                logger.error("error getting pre-signed url"+err);
                errorCallback(err);
            }
        });
    }
}

module.exports = new AttachmentService();