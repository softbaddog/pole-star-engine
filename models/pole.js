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
  led: {
    id: String,
    IMEI: String
  },
  airBox: {
    id: String,
    temperature: Number,
    humidity: Number,
    pressure: Number,
    noise: Number,
    windSpeed: Number,
    windDirection: Number,
    pm25: Number
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