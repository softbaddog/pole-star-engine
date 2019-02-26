var request = require('request');
var cfg = require('./config');

exports.notifyTypeList = [{
  notifyType: 'bindDevice',
  enabled: false
}, {
  notifyType: 'deviceAdded',
  enabled: true
}, {
  notifyType: 'deviceInfoChanged',
  enabled: true
}, {
  notifyType: 'deviceDataChanged',
  enabled: true
}, {
  notifyType: 'deviceDatasChanged',
  enabled: false
}, {
  notifyType: 'deviceDeleted',
  enabled: true
}, {
  notifyType: 'messageConfirm',
  enabled: false
}, {
  notifyType: 'commandRsp',
  enabled: false
}, {
  notifyType: 'deviceEvent',
  enabled: false
}, {
  notifyType: 'serviceInfoChanged',
  enabled: false
}, {
  notifyType: 'ruleEvent',
  enabled: false
}, {
  notifyType: 'deviceModelAdded',
  enabled: false
}, {
  notifyType: 'deviceModelDeleted',
  enabled: false
}, {
  notifyType: 'deviceDesiredPropertiesModifyStatusChanged',
  enabled: false
}];

exports.cleanAllSub = (loginInfo) => {
  return new Promise((resolve, reject) => {
    request({
        method: "DELETE",
        url: 'https://' + cfg.host + ':' + cfg.port + '/iocm/app/sub/v1.2.0/subscriptions',
        cert: cfg.cert,
        key: cfg.key,
        strictSSL: false,
        json: true,
        headers: {
          'app_key': cfg.appId,
          'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
        }
      },
      (err, res, body) => {
        if (!err && res.statusCode === 204) {
          console.log("sub clean ok");
          resolve();
        } else {
          console.log(err, body);
        }
      });
  });
};

exports.subscribe = (loginInfo, notifyType) => {
  return new Promise((resolve, reject) => {
    request({
      method: "POST",
      // url: 'https://' + cfg.host + ':' + cfg.port + '/iocm/app/sub/v1.1.0/subscribe',
      url: 'https://' + cfg.host + ':' + cfg.port + '/iocm/app/sub/v1.2.0/subscriptions',
      cert: cfg.cert,
      key: cfg.key,
      strictSSL: false,
      json: true,
      headers: {
        'app_key': cfg.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      body: {
        notifyType: notifyType,
        callbackUrl: cfg.callback_url
        // callbackurl: 'https://127.0.0.1:443/callback'
      }
    }, (err, res, body) => {
      if (!err && res.statusCode === 201) {
        console.log("sub '" + notifyType + "' ok");
      } else {
        console.log(err, body);
      }
    });
  });
};