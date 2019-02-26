var request = require('request');
var cfg = require('./config');

const url = 'https://' + cfg.host + ':' + cfg.port;

// Get products List
exports.getProducts = (loginInfo, pageNo, pageSize) => {
  return new Promise((resovle, reject) => {
    var options = {
      method: 'GET',
      url: url + '/api/v3.0/products',
      cert: cfg.cert,
      key: cfg.key,
      headers: {
        'app_key': cfg.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'ownerAppId': cfg.appId,
        'pageNo': pageNo,
        'pageSize': pageSize
      },
      strictSSL: false,
      json: true
    };
    request(options, (err, res, body) => {
      console.log(body);
      if (!err && res.statusCode === 200) {
        resovle({
          result: true,
          totalCount: body.totalCount,
          products: body.products
        });
      } else {
        console.err(err);  
      }
    });
  });
};