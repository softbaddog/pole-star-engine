var request = require('request');
var cfg = require('./config');

const url = 'https://' + cfg.host + ':' + cfg.port;

const createOptions = (loginInfo, nodeId, productId) => {
  if (cfg.mode == 'platform') {
    return {
      method: 'POST',
      url: url + '/iocm/app/reg/v1.2.0/devices',
      cert: cfg.cert,
      key: cfg.key,
      headers: {
        'app_key': cfg.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'appId': cfg.appId
      },
      body: {
        'verifyCode': nodeId,
        'nodeId': nodeId,
        'timeout': 0
      },
      strictSSL: false,
      json: true
    };
  } else {
    return {
      method: 'POST',
      url: url + '/api/v3.0/devices',
      cert: cfg.cert,
      key: cfg.key,
      headers: {
        'app_key': cfg.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'ownerAppId': cfg.appId
      },
      body: {
        'name': 'xxx',
        'productId': productId,
        'nodeId': nodeId,
        'timeout': 0
      },
      strictSSL: false,
      json: true
    };
  }
};

// register a device
exports.registerDevice = (loginInfo, nodeId, productId) => {
  return new Promise((resolve, reject) => {
    request(createOptions(loginInfo, nodeId, productId), (err, res, body) => {
      console.log(body);
      if (!err && res.statusCode === 200) {
        resolve(body.deviceId);
      } else {
        console.log(err);
      }
    });
  });
};

const deleteOptions = (loginInfo, deviceId) => {
  if (cfg.mode == 'platform') {
    return {
      method: 'DELETE',
      url: url + '/iocm/app/dm/v1.4.0/devices/' + deviceId,
      cert: cfg.cert,
      key: cfg.key,
      headers: {
        'app_key': cfg.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'appId': cfg.appId
      },
      strictSSL: false,
      json: true
    };
  } else {
    return {
      method: 'DELETE',
      url: url + '/api/v3.0/devices/' + deviceId,
      cert: cfg.cert,
      key: cfg.key,
      headers: {
        'app_key': cfg.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'ownerAppId': cfg.appId
      },
      strictSSL: false,
      json: true
    };
  }
};

// delete a device
exports.deleteDevice = (loginInfo, deviceId) => {
  return new Promise((resolve, reject) => {
    request(deleteOptions(loginInfo, deviceId), (err, res, body) => {
      console.log(body, res.statusCode);
      if (!err) {
        resolve({
          result: true
        });
      } else {
        console.log(err);
      }
    });
  });
};

const statusOptions = (loginInfo, deviceId) => {
  if (cfg.mode == 'platform') {
    return {
      method: 'GET',
      url: url + '/iocm/app/reg/v1.1.0/deviceCredentials/' + deviceId,
      cert: cfg.cert,
      key: cfg.key,
      headers: {
        'app_key': cfg.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'appId': cfg.appId
      },
      strictSSL: false,
      json: true
    };
  } else {
    return {
      method: 'GET',
      url: url + '/api/v3.0/devices/' + deviceId + '/status',
      cert: cfg.cert,
      key: cfg.key,
      headers: {
        'app_key': cfg.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'deviceId': deviceId,
        'ownerAppId': cfg.appId
      },
      strictSSL: false,
      json: true
    };
  }
};

// Query a device's status
exports.statusDevice = (loginInfo, deviceId) => {
  return new Promise((resolve, reject) => {
    request(statusOptions(loginInfo, deviceId), (err, res, body) => {
      console.log(body);
      if (!err) {
        if (cfg.mode == 'platform') {
          resolve({
            status: body.activated ? 'ACTIVE' : 'UNACTIVE'
          });
        } else {
          resolve({
            status: body.status
          });
        }
      } else {
        console.log(err);
      }
    });
  });
};

// Update a device
exports.updateDevice = (loginInfo, deviceId, deviceName, product) => {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'PUT',
      url: 'https://' + cfg.host + ':' + cfg.port + '/iocm/app/dm/v1.4.0/devices/' + deviceId,
      cert: cfg.cert,
      key: cfg.key,
      headers: {
        'app_key': cfg.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'appId': cfg.appId
      },
      body: {
        name: deviceName,
        manufacturerId: product.manufacturerId,
        manufacturerName: product.manufacturerName,
        deviceType: product.deviceType,
        model: product.model,
        protocolType: product.protocolType
      },
      strictSSL: false,
      json: true
    };
    request(options, (err, res, body) => {
      console.log(body);
      if (!err) {
        resolve({
          deviceInfo: {
            deviceId: deviceId,
            deviceName: deviceName
          }
        });
      } else {
        console.log(err);
      }
    });
  });
};

// Get device list
exports.getDevices = (loginInfo, pageNo, pageSize) => {
  return new Promise((resovle, reject) => {
    var options = {
      method: 'GET',
      url: 'https://' + cfg.host + ':' + cfg.port + '/iocm/app/dm/v1.4.0/devices',
      cert: cfg.cert,
      key: cfg.key,
      headers: {
        'app_key': cfg.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'appId': cfg.appId,
        'pageNo': pageNo,
        'pageSize': pageSize
      },
      strictSSL: false,
      json: true
    };
    request(options, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        resovle({
          result: true,
          totalCount: body.totalCount,
          devices: body.devices
        });
      } else {
        reject({
          result: false
        });
      }
    });
  });
};

// Get a device Info
exports.getDeviceInfo = (loginInfo, deviceId) => {
  return new Promise((resovle, reject) => {
    var options = {
      method: 'GET',
      url: 'https://' + cfg.host + ':' + cfg.port + '/iocm/app/dm/v1.4.0/devices/' + deviceId,
      cert: cfg.cert,
      key: cfg.key,
      headers: {
        'app_key': cfg.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'appId': cfg.appId,
      },
      strictSSL: false,
      json: true
    };
    request(options, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        resovle({
          result: true,
          device: body
        });
      } else {
        reject({
          result: false
        });
      }
    });
  });
};

// Get data history
exports.getDataHistorty = (loginInfo, deviceId, pageNo, pageSize) => {
  return new Promise((resovle, reject) => {
    var options = {
      method: 'GET',
      url: 'https://' + cfg.host + ':' + cfg.port + '/iocm/app/data/v1.1.0/deviceDataHistory',
      cert: cfg.cert,
      key: cfg.key,
      headers: {
        'app_key': cfg.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'deviceId': deviceId,
        'gatewayId': deviceId,
        'pageNo': pageNo,
        'pageSize': pageSize
      },
      strictSSL: false,
      json: true
    };
    request(options, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        resovle({
          result: true,
          totalCount: body.totalCount,
          dataHistorty: body.deviceDataHistoryDTOs
        });
      } else {
        reject({
          result: false
        });
      }
    });
  });
};