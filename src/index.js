"use strict";

var env = require('dotenv').load();
var logger = require('./config/LoggerConfig');
var MQTTService = require('./services/MQTTService');
var mosca    = require('mosca');
var RestEndpoints = require('./services/RestEndpoints');

var ascoltatore = {
    type: 'redis',
    redis: require('redis'),
    db: 12,
    port: 6379,
    return_buffers: true, // to handle binary payloads
    host: "localhost"
};

var moscaSettings = {
    port: 1883,
    http: {
        port: 8000,
        bundle: true
    },
    //backend: ascoltatore,
    persistence: {
        factory: mosca.persistence.LevelUp,
        path: './moscadb',
        ttl: {
            subscriptions: 1000 * 60 * 10,
            packets: 1000 * 60 * 10
        }
    }
};

MQTTService.init(moscaSettings);
RestEndpoints.init();

/*
var env = require('dotenv').load();
var logger = require('./config/LoggerConfig');
var aedes = require('aedes')();
var Buffer = require('buffer').Buffer;
var AttachmentService = require('./services/AttachmentService');
var server = require('net').createServer(aedes.handle);
var port = 1883;
var PRIVATE_PUBSUB_TOPIC  =  'stitchchat/private/inbox/';
var GET_SIGNED_URL_TOPIC  = 'stitchchat/signedURL';
var PRIVATE_SIGNED_URL_TOPIC_PREFIX = 'stitchchat/private/signedURL/';

server.listen(port, function () {
    logger.debug('server listening on port', port);
});

aedes.authenticate = function (client, username, password, callback) {
    callback(null, true);
};

aedes.published = function(packet, client, callback){
    logger.debug("message published with packet "+packet.topic);
    try{
        logger.debug("published message"+ packet.payload + " from "+client);
        if(packet.topic == GET_SIGNED_URL_TOPIC){
            if(packet.payload){
                var payloadStr = packet.payload.toString();
                sendPresignedUrlToClient(payloadStr, client.id);
            }
        }
    }catch(err){
        console.log("error publishing message "+ err);
    }finally{
        callback(null, packet);
    }

}

function sendPresignedUrlToClient(payloadStr, clientId){
    var attachmentRequestMessage = JSON.parse(payloadStr);
    if(!(attachmentRequestMessage && attachmentRequestMessage.messageId)){
        return;
    }
    var successCallback = function(signedUrlResponse){

        var payload = {
            messageId : attachmentRequestMessage.messageId,
            presignedUrl : signedUrlResponse.url,
            attachmentId : signedUrlResponse.attachmentId
        };

        var payloadJson = JSON.stringify(payload);
        var encodedPhoneNumber = encodeURIComponent(clientId);
        var attachmentResponseMessage = {
            topic: PRIVATE_SIGNED_URL_TOPIC_PREFIX + encodedPhoneNumber,
            payload: new Buffer(payloadJson),
            qos: 1,
            retain: false
        };

         aedes.publish(attachmentResponseMessage, function() {
            console.log('sent presignedurl to client '+encodedPhoneNumber);
         });
    }

    var errorCallback = function(err){
        logger.error(err);
    }

    AttachmentService.getPresignedUrl(successCallback, errorCallback, attachmentRequestMessage.fileExtension);

}*/
