var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://broker.mqttdashboard.com');

client.on('connect', function () {
  client.subscribe('stitchchat/outbox');
});

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString());
  client.publish('stitchchat/inbox/%2B13392247442', message.toString());
});