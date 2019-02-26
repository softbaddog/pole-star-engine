var fs = require('fs');
var path = require('path');

// IoT Cloud（Hub）
module.exports = {
	mode: 'hub', // hub,platform
	encode: 'base64', // base64, msgpack, default
	host: 'iot-api.huaweicloud.com', //49.4.80.153
	port: '8743',
	appId: 'I5CdO5AuYhrNBy6G4I24g2cfgfMa',
	secret: 'vhY9yQlBeWFkVvIyQyxEL6qHWiIa',
	cert: fs.readFileSync(path.resolve(__dirname, 'ssl/client.crt')),
	key: fs.readFileSync(path.resolve(__dirname, 'ssl/client.key'))
};