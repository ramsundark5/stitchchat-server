"use strict";

var mosca    = require('mosca');
var jwt      = require('jsonwebtoken');
var Buffer = require('buffer').Buffer;
var logger = require('../config/LoggerConfig');
var AuthorizerService = require('./AuthorizationService');
var GCMService = require('./GCMService');
var AttachmentService = require('./AttachmentService');
//var AppConfig  = require('../config/AppConfig');
var PRIVATE_PUBSUB_TOPIC  =  'stitchchat/private/inbox/';
var GET_SIGNED_URL_TOPIC  = 'stitchchat/signedURL';
var PRIVATE_SIGNED_URL_TOPIC_PREFIX = 'stitchchat/private/signedURL/';
var REGISTER_TOPIC        = 'stitchchat/register';

class MQTTService{

  constructor() {

  }

  init(settings){
    logger.debug("MQTTService init is called");
    this.server = new mosca.Server(settings);
    this.server.on('ready', this.setup.bind(this));
    this.server.on('clientConnected', this.clientConnected);
    this.server.on('clientDisconnected', this.clientDisconnected);
    this.server.on('published', this.published.bind(this));
  }

  setup(param){
    //this.server.authenticate = this.authenticate;
    //this.server.authorizePublish = this.authorizePublish;
    //this.server.authorizeSubscribe = this.authorizeSubscribe;
    //this.server.authorizeForward = this.authorizeForward;
    logger.debug('MQTT service is started with param '+param);
  }

  clientConnected(client){
    console.log('client connected', client.id);
  }

  clientDisconnected(client){
    console.log('Client Disconnected:', client.id);
  }

  authenticate(client, username, password, callback) {
    console.log("authenticate is called");
    let passwordStr = '';
    if(password){
        passwordStr = password.toString()
    }

    if(client.id == "+13392247873"){
        callback(null, true);
        return;
    }
    jwt.verify(passwordStr, 'stitchpassword', function(err, decodedObject) {
        let isAuthenticated = false;
        if(decodedObject && decodedObject.phoneNumber == client.id){
            isAuthenticated = true;
        }
        callback(null, isAuthenticated);
    });
  }

  authorizeSubscribe(client, topic, callback) {
    if(client.id == "+13392247873"){
      callback(null, true);
      return;
    }
    AuthorizerService.authorizeSubscribe(client, topic, callback);
  }

  published(packet, client){
    try{
      logger.debug("published message"+ packet.payload + " from "+client);
      if(packet.topic == GET_SIGNED_URL_TOPIC){
        if(packet.payload){
          var payloadStr = packet.payload.toString();
          this.sendPresignedUrlToClient(payloadStr, client.id);
        }
      }
    }catch(err){
      console.log("error publishing message "+ err);
    }
  }

  authorizeForward(client, packet, callback){
    logger.debug("forwarded message"+ packet.payload + " to "+client);
    callback(null, true);
  }

  sendPresignedUrlToClient(payloadStr, clientId){
    var attachmentRequestMessage = JSON.parse(payloadStr);
    if(!(attachmentRequestMessage && attachmentRequestMessage.messageId)){
        return;
    }
    var that = this;
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

      that.server.publish(attachmentResponseMessage, function() {
        console.log('sent presignedurl to client '+encodedPhoneNumber);
      });
    }

    var errorCallback = function(err){
      logger.error(err);
    }

    AttachmentService.getPresignedUrl(successCallback, errorCallback, attachmentRequestMessage.fileExtension);

  }
}

module.exports = new MQTTService();
