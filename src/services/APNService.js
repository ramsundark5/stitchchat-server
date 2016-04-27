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

       /* var feedbackoptions = {
            "batchFeedback": true,
            "interval": 300,
            "cert": process.env.APNS_CERT_PEM,
            "key": process.env.APNS_KEY_PEM,
            "passphrase": process.env.APNS_KEY_PASSWORD,
            "production": process.env.PRODUCTION
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

        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.badge = 1;
        note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
        note.payload = message;

        this.apnConnection.pushNotification(note, device);
    }
}

module.exports = new APNService();