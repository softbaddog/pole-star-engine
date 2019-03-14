const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var busStationSchema = new Schema({

});

module.exports = mongoose.model('bs', busStationSchema);