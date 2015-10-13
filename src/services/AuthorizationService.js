"use strict";

var PRIVATE_PUBSUB_TOPIC  =  'stitchchat/private/inbox/';
var UserDao               = require('../dao/UserDao');
var logger                = require('../config/LoggerConfig');
class AuthorizerService{

    authorizePublish(client, topic, callback){
        let usernameFromTopic = this.parseUserNameFromPublishedTopic(topic);
        if(usernameFromTopic == "+13392247873"){
            callback(null, true);
            return;
        }

        UserDao.getUser(usernameFromTopic, function(err, userObj){
            let isAuthorized = false;
            if(userObj){
                let blockedUsersList = userObj.blockedUsersList;
                if(blockedUsersList && blockedUsersList.contains(client.id)){
                    isAuthorized = true;
                }
            }
            if(!isAuthorized){
                logger.warn("Authorization failed. sender is  "+client.id +". Receiver is "+usernameFromTopic);
            }
            callback(null, isAuthorized);
        });
    }

    authorizeSubscribe(client, topic, callback) {
        let isAuthorized =  false;
        let usernameFromTopic = this.parseUserNameFromPublishedTopic(topic);
        if(usernameFromTopic == client.id){
            isAuthorized =  true;
        }
        if(!isAuthorized){
            logger.warn("Authorization failed. subscriber is  "+client.id +". Subscription topic is "+usernameFromTopic);
        }
        callback(null, isAuthorized);
    }

    parseUserNameFromPublishedTopic(topic){
        if(topic && topic.startsWith(PRIVATE_PUBSUB_TOPIC)){
            let usernameFromTopic = topic.substring(PRIVATE_PUBSUB_TOPIC.length);
            let decodedUsernameFromTopic = decodeURIComponent(usernameFromTopic);
            return decodedUsernameFromTopic;
        }
    }
}

module.exports = new AuthorizerService();