const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var poleSchema = new Schema({
  siteId: {
    type: String,
    index: true,
    unique: true
  },
  siteName: String,
  lon: Number,
  lat: Number,
  leds: [{
    id: String,
    deviceId: {
      type: String,
      default: 0
    },
    productId: {
      type: String,
      default: 0
    },
    status: String,
    brightness: {
      type: Number,
      default: 0
    }
  }],
  airBox: {
    id: String,
    realtime: {
      "temperature": String,
      "humidity": String,
      "pressure": String,
      "noise": String,
      "wind-speed": String,
      "wind-direction": String,
      "pm25": String
    },
    timestamp: Date
  },
  adScreen: {
    id: String,
    city: String,
    station: String,
    picLink: String
  },
  camera: {
    id: String,
    crowDensity: {
      enable: Boolean,
      sensitivity: Number,
      alarmCheckInterval: Number,
      alarmCheckNumber: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('Pole', poleSchema);