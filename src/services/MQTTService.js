"use strict";

var mosca    = require('mosca');
var Buffer = require('buffer').Buffer;
var logger = require('../config/LoggerConfig');
var AuthenticationService = require('./AuthenticationService');
var AuthorizerService = require('./AuthorizationService');
var GCMService = require('./GCMService');
var AttachmentService = require('./AttachmentService');
var AppConfig  = require('../config/AppConfig');

var PRIVATE_PUBSUB_TOPIC  =  'stitchchat/private/inbox/';
var GROUP_PUBSUB_TOPIC    =  'stitchchat/group/inbox/';
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
    //AuthenticationService.authenticate(username);
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
      switch (packet.topic) {
        case GET_SIGNED_URL_TOPIC:
          if(packet.payload){
            var payloadStr = packet.payload.toString();
            this.sendPresignedUrlToClient(payloadStr, client.id);
          }
          break;

        case REGISTER_TOPIC:
          if(packet.payload){
            var payloadStr = packet.payload.toString();
            this.registerUser(payloadStr, client);
          }
          break;

        default:
          break;
      }
    }catch(err){
      console.log("error publishing message "+ err);
    }
  }

  authorizeForward(client, packet, callback){
    logger.debug("forwarded message"+ packet.payload + " to "+client);
    callback(null, true);
  }

  registerUser(payloadStr){
    var registrationMessage = JSON.parse(payloadStr);
    if(!(registrationMessage && registrationMessage.authHeaders)){
      return;
    }
    AuthenticationService.registerUser(registrationMessage.providerUrl, registrationMessage.authHeaders);
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
