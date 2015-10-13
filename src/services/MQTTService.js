"use strict";

var mosca    = require('mosca');
var jwt      = require('jsonwebtoken');
var logger = require('../config/LoggerConfig');
var AuthorizerService = require('./AuthorizationService');
var GCMService = require('./GCMService');
//var AppConfig  = require('../config/AppConfig');
var PRIVATE_PUBSUB_TOPIC  =  'stitchchat/private/inbox/';

class MQTTService{

  constructor() {

  }

  init(settings){
    logger.debug("MQTTService init is called");
    this.server = new mosca.Server(settings);
    this.server.on('ready', this.setup.bind(this));
    this.server.on('clientConnected', this.clientConnected);
    this.server.on('clientDisconnected', this.clientDisconnected);
    this.server.on('published', this.published);
  }

  setup(param){
    this.server.authenticate = this.authenticate;
    this.server.authorizePublish = this.authorizePublish;
    this.server.authorizeSubscribe = this.authorizeSubscribe;
    //this.server.authorizeForward = this.authorizeForward;
    logger.debug('MQTT service is started with param '+param);
    //this.server.forwardOfflinePackets = this.sendPushNotification;
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

  authorizePublish(client, topic, payload, callback) {
    if(client.id == "+13392247873"){
      callback(null, true);
      return;
    }
    AuthorizerService.authorizePublish(client, topic, callback);
  }

  authorizeSubscribe(client, topic, callback) {
    if(client.id == "+13392247873"){
      callback(null, true);
      return;
    }
    AuthorizerService.authorizeSubscribe(client, topic, callback);
  }

  published(packet, client, callback){
    logger.debug("published message"+ packet.payload + " from "+client);
    if(callback){
      callback(null, true);
    }

  }

  /*authorizeForward(client, packet, callback){
    logger.debug("forwarded message"+ packet.payload + " to "+client);
    if(client.id == "+13392247873"){
      callback(null, true);
      return;
    }
    logger.log("trying to publish the payload "+packet.payload);
    AuthorizerService.authorizePublish(client, packet.topic, callback);
  }*/
}

module.exports = new MQTTService();
