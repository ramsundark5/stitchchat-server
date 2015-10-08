"use strict";

var mosca    = require('mosca');
var jwt      = require('jsonwebtoken');
var settings = {
  port: 1883
};
var INBOX_TOPIC_PREFIX = 'stitchchat/inbox/';

class MQTTService{

  constructor() {

  }

  init(){
    console.log("MQTTService init is called");
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
    this.server.forwardOfflinePackets = this.sendPushNotification;
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
    jwt.verify(passwordStr, 'stitchpassword', function(err, decodedObject) {
        if(decodedObject && decodedObject.phoneNumber == client.id){
            callback(null, true);
        }
        else{
            callback(null, false);
        }
    });
  }

  authorizePublish(client, topic, payload, callback) {
    callback(null, true);
  }

  authorizeSubscribe(client, topic, callback) {
    if(topic && topic.startsWith(INBOX_TOPIC_PREFIX)){
      var usernameFromTopic = topic.substring(topic.length - INBOX_TOPIC_PREFIX.length);
      if(usernameFromTopic == client.id){
        callback(null, true);
      }
      else{
        callback(null, false);
      }
    }
  }

  published(packet, client) {
    console.log('Published', packet.payload);
  }

  sendPushNotification(client, callback){
    callback(null, true);
  }
}

module.exports = new MQTTService();
