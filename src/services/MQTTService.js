var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://broker.mqttdashboard.com');

client.on('connect', function () {
  client.subscribe('stitchchat/outbox');
});

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString());
  //let receiverId = message.receiverId;
  var receiverId = '+13392247442';
  var encodedReceiverId = encodeURIComponent(receiverId);
  var receiverInboxTopic = 'stitchchat/inbox/'+encodedReceiverId;
  client.publish(receiverInboxTopic, message.toString());
});