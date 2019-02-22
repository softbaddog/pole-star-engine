const net = require('net');

const U16_OFFSET = 2;
const HEAD_OFFSET = 4;
const LENGTH_OFFSET = 2;
const CMD_OFFSET = 1;
const TEMPERATURE_OFFSET = HEAD_OFFSET + LENGTH_OFFSET + CMD_OFFSET;
const HUMIDITY_OFFSET = TEMPERATURE_OFFSET + U16_OFFSET;
const PRESSURE_OFFSET = HUMIDITY_OFFSET + U16_OFFSET;
const NOISE_OFFSET = PRESSURE_OFFSET + U16_OFFSET;
const WIND_SPEED_OFFSET = NOISE_OFFSET + U16_OFFSET;
const WIND_DIRECTION_OFFSET = WIND_SPEED_OFFSET + U16_OFFSET;
const PM25_OFFSET = WIND_DIRECTION_OFFSET + U16_OFFSET;

const server = net.createServer();

server.on('connection', function (socket) {
  socket.setKeepAlive(true, 1000);
  console.log('NEW SOCKET');

  socket.on('data', function (data) {
    // console.log('received data: ' + data.toString());
    const buf = Buffer.from(data, 'hex');
    console.log(buf);
    const realtime = {
      "temperature": (buf.readInt16BE(TEMPERATURE_OFFSET) / 10).toFixed(1) + "℃",
      "humidity": (buf.readInt16BE(HUMIDITY_OFFSET) / 10).toFixed(1) + "rh%",
      "pressure": buf.readInt16BE(PRESSURE_OFFSET) + "hPa",
      "noise": (buf.readInt16BE(NOISE_OFFSET) / 10).toFixed(1) + "db",
      "wind-speed": (buf.readInt16BE(WIND_SPEED_OFFSET) / 10).toFixed(1) + "m/s",
      "wind-direction": buf.readInt16BE(WIND_DIRECTION_OFFSET) + "°",
      "pm25": (buf.readInt16BE(PM25_OFFSET)).toFixed(1) + "ug/m3"
    };
    console.log(JSON.stringify(realtime));
    socket.write(Buffer.from('fefefe680200e2e4', 'hex'));
  });
  socket.on('close', function () {
    console.log('SOCKET CLOSED');
  });
})

server.on('error', function (err) {
  console.log('SERVER ERROR:', err.message);
})

server.listen(9000, () => {
  console.log('server bound');
});