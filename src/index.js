"use strict";

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
    backend: ascoltatore,
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