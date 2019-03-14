const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var weatherSchema = new Schema({
  city: String,
  updatedAt: {
    type: Date,
    default: Date.now()
  },
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
  futures: [{
    "temperature": String,
    "weather": String,
    "weather_id": {
      "fa": String,
      "fb": String
    },
    "wind": String,
    "week": String,
    "date": String
  }]
});

module.exports = mongoose.model('Weather', weatherSchema);