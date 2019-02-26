const request = require('request');
const cfg = require('./config');

const url = 'https://' + cfg.host + ':' + cfg.port;

const loginOptions = () => {
  if (cfg.mode == 'platform') {
    return {
      method: 'POST',
      url: url + '/iocm/app/sec/v1.1.0/login',
      cert: cfg.cert,
      key: cfg.key,
      form: {
        appId: cfg.appId,
        secret: cfg.secret
      },
      strictSSL: false,
      json: true
    };
  } else {
    return {
      method: 'POST',
      url: url + '/api/v3.0/auth/tokens',
      cert: cfg.cert,
      key: cfg.key,
      body: {
        key: cfg.appId,
        secret: cfg.secret
      },
      strictSSL: false,
      json: true
    };
  }
};

// fetch accessToken when longin, and update before timeout
exports.fetchAccessToken = () => {
  return new Promise((resolve, reject) => {
    request(loginOptions(), (err, res, body) => {
      if (!err && res.statusCode === 200) {
        exports.loginInfo = body;
        console.log('fetchAccessToken: ' + JSON.stringify(body));
        resolve(body);
        // update token periodicity
        setTimeout(() => {
          this.fetchAccessToken();
        }, body.expiresIn * 1000 * 0.9);
      } else {
        console.log(err, body);
      }
    });
  });
};

const logoutOptions = (loginInfo) => {
  if (cfg.mode == 'platform') {
    return {
      method: 'POST',
      url: url + '/iocm/app/sec/v1.1.0/logout',
      cert: cfg.cert,
      key: cfg.key,
      body: {
        accessToken: loginInfo.accessToken
      },
      strictSSL: false,
      json: true
    };
  }
};