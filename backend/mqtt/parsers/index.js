// mqtt/parsers/index.js

const dht11Parser = require("./dht11.parser");
const gasParser = require("./gas.parser");
const soundParser = require("./sound.parser");


// clé = sensorType (dans le topic MQTT)
module.exports = {
  dht11: dht11Parser,
  gas: gasParser,
  sound: soundParser

};
