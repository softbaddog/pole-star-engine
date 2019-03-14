const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var poleSchema = new Schema({
  site: {
    id: {
      type: String,
      index: true,
      unique: true
    },
    name: String,
    lon: Number,
    lat: Number,
  },
  nbLed: {
    id: String,
    leds: [{
      id: String,
      name: String,
      deviceId: {
        type: String,
        default: 0
      },
      status: String,
      brightness: {
        type: Number,
        default: 0
      },
      data: {
        type: String,
        default: ''
      }
    }]
  },
  airBox: {
    id: {
      type: String,
      index: true,
      unique: true
    },
    gatherTime: Date,
    today: {
      "temperature": String,
      "weather": String,
      "weather_id": {
        "fa": String,
        "fb": String
      },
      "wind": String,
      "week": String,
      "city": String,
      "date": String
    },
    future: [{
      "temperature": String,
      "weather": String,
      "weather_id": {
        "fa": String,
        "fb": String
      },
      "wind": String,
      "week": String,
      "date": String
    }],
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
    id: {
      type: String,
      index: true,
      unique: true
    },
    city: String,
    station: String,
    picLinks: [String]
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

module.exports = mongoose.model('pole', poleSchema);