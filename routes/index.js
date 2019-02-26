const express = require('express');
const moment = require('moment');
const _ = require('underscore');
const router = express.Router();
const Pole = require('../models/pole');
const auth = require('../iotplatform/auth');
const pm = require('../iotplatform/pm');
const dm = require('../iotplatform/dm');
const cfg = require('../iotplatform/config');

const myEmitter = require('../MyEmitter');
myEmitter.on('data', (data) => {
  var idx;
  let msg;
  var d = JSON.parse(data.toString());
  var hasRawData = d.services.some(function (elem, index) {
    idx = index;
    return elem.serviceId == 'RawData';
  });
  if (hasRawData) {
    switch (cfg.encode) {
      case 'base64':
        console.log(Buffer.from(d.services[idx].data.rawData, 'base64').toString());
        break;

      case 'msgpack':
        console.log(msgpack.decode(Buffer.from(d.services[idx].data.rawData, 'base64')));
        break;

      default:
        break;
    }
  }
});

/* GET home page. */
router.get('/', function (req, res, next) {
  Pole.find({}, function (err, poles) {
    for (const pole of poles) {
      dm.statusDevice(auth.loginInfo, pole.leds[0].deviceId)
        .then(data => {
          pole.leds[0].status = data.status;
          pole.save();
          
          res.render('index', {
            title: 'PoleStarEngine',
            poles: poles
          });
        });
    }
  })
});

/* GET new page. */
router.get('/pole/new', function (req, res, next) {
  let pageNo = parseInt(req.query.pageNo) || 0;
  let pageSize = parseInt(req.query.pageSize) || 10;
  pm.getProducts(auth.loginInfo, pageNo, pageSize)
    .then(data => {
      res.render('new', {
        title: 'PoleStarEngine',
        totalCount: data.totalCount,
        products: data.products,
        pole: {
          siteId: '',
          siteName: '',
          lon: null,
          lat: null,
          leds: [{
              id: ''
            },
            {
              id: ''
            }
          ],
          airBox: {
            id: ''
          },
          adScreen: {
            id: ''
          }
        }
      });
    });
});

// GET update page
router.get('/pole/update/:id', function (req, res, next) {
  var id = req.params.id;
  if (id) {
    Pole.findById(id, function (err, pole) {
      res.render('new', {
        title: 'PoleStarEngine',
        pole: pole
      });
    });
  }
});

router.post('/pole', function (req, res, next) {
  console.log(req.body);
  var id = req.body.pole._id;
  var poleObj = req.body.pole;
  var _pole;
  if (id !== '') {
    Pole.findById(id, function (err, pole) {
      if (err) {
        console.log(err);
      }

      _pole = _.extend(pole, poleObj);
      _pole.save(function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          res.redirect('/');
        }
      });
    });
  } else {
    _pole = new Pole({
      siteId: poleObj.siteId,
      siteName: poleObj.siteName,
      lon: poleObj.lon,
      lat: poleObj.lat,
      leds: req.body.leds,
      airBox: {
        id: req.body.airBox.id
      },
      adScreen: {
        id: req.body.adScreen.id,
        city: req.body.adScreen.city,
        station: req.body.adScreen.station
      }
    });
    _pole.leds.forEach(led => {
      dm.registerDevice(auth.loginInfo, led.id, led.productId)
        .then(deviceId => {
          led.deviceId = deviceId;
          _pole.save(function (err) {
            if (err) {
              console.log(err);
            } else {
              res.redirect('/');
            }
          });
        });
    });
  }
});

// Delete a pole
router.delete('/pole', function (req, res, next) {
  Pole.findOneAndDelete({
    _id: req.query.id
  }, function (err, pole) {
    if (err) {
      console.log(err);
    } else {
      pole.leds.forEach(led => {
        dm.deleteDevice(auth.loginInfo, led.deviceId)
          .then(data => {
            res.json({
              success: 1
            });
          });
      });
    }
  });
});

// Get busStation
router.get('/busStation/:id', function (req, res) {
  var id = req.params.id;
  var pageNo = req.query.pageNo || 0;
  var pageSize = req.query.pageSize || 4;
  var maxShowBus = req.query.maxShowBus || 4;
  var ratioDiff = req.query.ratioDiff || 25;
  if (id) {
    const bs = require('../libs/busStation');
    bs.busStationInfo(id, pageNo, pageSize, maxShowBus, ratioDiff, res);
  }
});

// Get weather
router.get('/weather/:id', function (req, res) {
  var id = req.params.id;
  var futureDay = req.query.futureDay || 2;
  if (id) {
    const w = require('../libs/weather');
    w.weatherInfo(id, futureDay, res);
  }
});

module.exports = router;