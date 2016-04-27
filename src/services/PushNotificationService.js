"use strict";

var Firebase   = require('firebase');
var Queue      = require('firebase-queue');
var APNService = require('./APNService');
var GCMService = require('./GCMService');
var FirebaseTokenGenerator = require("firebase-token-generator");
var uuid = require('node-uuid');

class PushNotificationService{

    constructor(){
        APNService.init();
    }

    initQueueHandler(){
        var firebaseRef = new Firebase(process.env.FIREBASE_URL);
        var firebaseToken = this.generateFirebaseToken();
        const self = this;
        firebaseRef.authWithCustomToken(firebaseToken, function(error, result) {
            if (error) {
                console.log("Authentication Failed!", error);
            } else {
                console.log("Authenticated successfully with payload:", result.auth);
                console.log("Auth expires at:", new Date(result.expires * 1000));
                self.startPushNotifications(firebaseRef);
            }
        });
    }

    startPushNotifications(firebaseRef){
        var queueRef = firebaseRef.child('queue');
        var queue = new Queue(queueRef, function(message, progress, resolve, reject) {
            var receiverPhoneNumber = message.receiverId;
            firebaseRef.child('users').child(receiverPhoneNumber).once('value').then(function(userSnapshot) {
                var user = userSnapshot.val();
                if(!user){
                    resolve();
                }
                if(user.phoneType === 'ios'){
                    var apnsToken = user.pushToken;
                    if(apnsToken){
                        APNService.sendPushNotification(message, apnsToken);
                    }
                    resolve();
                }else{
                    var gcmToken = user.pushToken;
                    if(gcmToken){
                        GCMService.sendPushNotification(message, gcmToken);
                    }
                    resolve();
                }
            });
        });
    }

    generateFirebaseToken(){
        var tokenGenerator = new FirebaseTokenGenerator(process.env.FIREBASE_ACCESS_KEY);
        var uniqueId = uuid.v4();
        var token = tokenGenerator.createToken({ uid: uniqueId});
        return token;
    }
}

module.exports = new PushNotificationService();