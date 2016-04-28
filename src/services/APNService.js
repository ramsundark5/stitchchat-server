"use strict";

var apn = require('apn');
require('dotenv').config();

class APNService{

    init(){
        var options = {
            "cert": process.env.APNS_CERT_PEM,
            "key": process.env.APNS_KEY_PEM,
            "passphrase": process.env.APNS_KEY_PASSWORD
        };

        this.apnConnection = new apn.Connection(options);
        //this.sendPushNotification({'senderId': 'test sender', 'message': 'hello world'}, '644de1e177c534136f245ca0856345723f815626f205263a59b44f0c052c6662')
       /* var feedbackoptions = {
            "batchFeedback": true,
            "interval": 300,
            "cert": process.env.APNS_CERT_PEM,
            "key": process.env.APNS_KEY_PEM,
            "passphrase": process.env.APNS_KEY_PASSWORD,
        };

        var feedback = new apn.Feedback(feedbackoptions);
        feedback.on("feedback", function(devices) {
            devices.forEach(function(device) {
                // find out how to delete token from firebase
            });
        });*/
    }

    sendPushNotification(message, token){
        var device = new apn.Device(token);
        var note = new apn.Notification();

        note.expiry = Math.floor(Date.now() / 1000) + 3600 * 24; // Expires 24 hours from now.
        note.badge = 1;
        note.alert = {'title': message.senderId, 'body': message.message};
        note.payload = message;
        //note.payload = {'messageFrom': 'Caroline'};
        this.apnConnection.pushNotification(note, device);
    }
}

module.exports = new APNService();