const express = require('express');
const _ = require('underscore');
const multipart = require('connect-multiparty')();
const path = require('path');

const router = express.Router();
const Pole = require('../models/pole');
const auth = require('../iotplatform/auth');
const pm = require('../iotplatform/pm');
const dm = require('../iotplatform/dm');

/* GET home page. */
router.get('/', function (req, res, next) {
  Pole.find({}, function (err, poles) {
    if (!err && poles) {
      let count = 0;
      poles.forEach(pole => {
        pole.nbLed.leds.forEach(led => {
          dm.statusDevice(auth.loginInfo, led.deviceId)
            .then(data => {
              led.status = data.status;
              pole.save();
              count++;
            });
        })
      })
      let timer = setInterval(() => {
        if (poles.length * 2 === count) {
          clearInterval(timer);
          res.render('index', {
            title: 'PoleStarEngine',
            poles: poles
          });
        }
      }, 10);
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
          site: {
            id: '',
            name: '',
            lon: null,
            lat: null
          },
          nbLed: {
            id: '',
            leds: [{
                id: '',
                name: ''
              },
              {
                id: '',
                name: ''
              }
            ],
          },
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
  let pageNo = parseInt(req.query.pageNo) || 0;
  let pageSize = parseInt(req.query.pageSize) || 10;
  pm.getProducts(auth.loginInfo, pageNo, pageSize)
    .then(data => {
      if (id) {
        Pole.findById(id, function (err, pole) {
          res.render('new', {
            title: 'PoleStarEngine',
            totalCount: data.totalCount,
            products: data.products,
            pole: pole
          });
        });
      }
    });
});

router.post('/pole', multipart, function (req, res) {
  console.log(req.body);
  console.log(req.files);
  var id = req.body.pole._id;
  var poleObj = req.body.pole;
  var _pole;
  if (id !== '') {
    Pole.findById(id, function (err, pole) {
      if (err) {
        console.log(err);
      }
      
      var deviceId0 = pole.nbLed.leds[0].deviceId || 0;
      var deviceId1 = pole.nbLed.leds[1].deviceId || 0;

      var picLinks = pole.adScreen.picLinks;

      _pole = _.extend(pole, poleObj);
      _pole.adScreen.picLinks = new Array();

      _pole.nbLed.leds[0].deviceId = deviceId0;
      _pole.nbLed.leds[1].deviceId = deviceId1;

      req.files.images.forEach(function(img, index) {
        if (img.size) {
          _pole.adScreen.picLinks[index] = path.basename(img.path);
        } else {
          _pole.adScreen.picLinks[index] = picLinks[index];
        }
      })
      console.log(_pole);
      _pole.save(function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          res.redirect('/');
        }
      });
    });
  } else {
    let count = 0;
    _pole = new Pole({
      site: poleObj.site,
      nbLed: poleObj.nbLed,
      airBox: poleObj.airBox,
      adScreen: {
        id: poleObj.adScreen.id,
        city: poleObj.adScreen.city,
        station: poleObj.adScreen.station
      }
    });
    req.files.images.forEach(function (img) {
      if (img.size) {
        _pole.adScreen.picLinks.push(path.basename(img.path));
      }
    })
    _pole.nbLed.leds.forEach(led => {
      if (led.id !== '') {
        dm.registerDevice(auth.loginInfo, _pole.nbLed.id, led.id, led.name)
          .then(deviceId => {
            led.deviceId = deviceId;
            count++;
          });
      }
    });

    var timer = setInterval(() => {
      if (count === 2) {
        clearInterval(timer);
        _pole.save(function (err) {
          if (err) {
            console.log(err);
          } else {
            res.redirect('/');
          }
        });
      }
    }, 100);
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
      pole.nbLed.leds.forEach(led => {
        dm.deleteDevice(auth.loginInfo, led.deviceId);
      });
      res.json({
        success: 1
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

// Get weather
router.get('/ad/:id', function (req, res) {
  var id = req.params.id;
  if (id) {
    const ad = require('../libs/ad');
    ad.adInfo(id, res);
  }
});

module.exports = router;