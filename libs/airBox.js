const moment = require('moment');
const net = require('net');
const Pole = require('../models/pole');

const U16_OFFSET = 2;
const ID_OFFSET = 2;
const HEAD_OFFSET = 4;
const LENGTH_OFFSET = 2;
const CMD_OFFSET = 1;
const TEMPERATURE_OFFSET = ID_OFFSET + HEAD_OFFSET + LENGTH_OFFSET + CMD_OFFSET;
const HUMIDITY_OFFSET = TEMPERATURE_OFFSET + U16_OFFSET;
const PRESSURE_OFFSET = HUMIDITY_OFFSET + U16_OFFSET;
const NOISE_OFFSET = PRESSURE_OFFSET + U16_OFFSET;
const WIND_SPEED_OFFSET = NOISE_OFFSET + U16_OFFSET;
const WIND_DIRECTION_OFFSET = WIND_SPEED_OFFSET + U16_OFFSET;
const PM25_OFFSET = WIND_DIRECTION_OFFSET + U16_OFFSET;

const RET_SUCC_CODE = 'fefefe680200e2e4';

const server = net.createServer();

server.on('connection', function (socket) {
  socket.setKeepAlive(true, 1000);
  console.log('NEW SOCKET');

  socket.on('data', function (data) {
    const buf = Buffer.from(data, 'hex');
    console.log(buf);
    const id = buf.readUInt16BE(0);
    Pole.findOne({
      "airBox.id": id
    }, function (err, pole) {
      if (!err) {
        pole.airBox.realtime = {
          "temperature": (buf.readInt16BE(TEMPERATURE_OFFSET) / 10).toFixed(1) + "℃",
          "humidity": (buf.readInt16BE(HUMIDITY_OFFSET) / 10).toFixed(1) + "rh%",
          "pressure": buf.readInt16BE(PRESSURE_OFFSET) + "hPa",
          "noise": (buf.readInt16BE(NOISE_OFFSET) / 10).toFixed(1) + "db",
          "wind-speed": (buf.readInt16BE(WIND_SPEED_OFFSET) / 10).toFixed(1) + "m/s",
          "wind-direction": buf.readInt16BE(WIND_DIRECTION_OFFSET) + "°",
          "pm25": (buf.readInt16BE(PM25_OFFSET)).toFixed(1) + "ug/m3"
        };
        pole.airBox.timestamp = moment().format();
        console.log(JSON.stringify(pole.airBox));
        pole.save();
      } else {
        console.log(err);
      }
    });
    socket.write(Buffer.from(RET_SUCC_CODE, 'hex'));
  });
  socket.on('close', function () {
    console.log('SOCKET CLOSED');
  });
})

server.on('error', function (err) {
  console.log('SERVER ERROR:', err.message);
})

server.listen(8234, () => {
  console.log('SERVER WORKING on 8234 ');
});