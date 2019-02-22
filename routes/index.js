const express = require('express');
const moment = require('moment');
const _ = require('underscore');
const router = express.Router();
const Pole = require('../models/pole');

/* GET home page. */
router.get('/', function (req, res, next) {
  Pole.find({}, function (err, docs) {
    res.render('index', {
      title: 'PoleStarEngine',
      poles: docs
    });
  })
});

/* GET new page. */
router.get('/pole/new', function (req, res, next) {
  res.render('new', {
    title: 'PoleStarEngine',
    pole: {
      siteId: '',
      siteName: '',
      lon: null,
      lat: null,
      airBox: {
        id: ''
      },
      adScreen: {
        id: ''
      }
    }
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
  var id = req.body.pole._id;
  var poleObj = req.body.pole;
  var _pole;
  console.log(poleObj);
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
      airBox: {
        id: req.body.airBox.id
      },
      adScreen: {
        id: req.body.adScreen.id
      }
    });
    _pole.save(function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
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
      res.json({
        success: 1
      });
    }
  });
});

module.exports = router;