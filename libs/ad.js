const moment = require('moment');
const Pole = require('../models/pole');

const url_head = "http://localhost:3000/images/"

exports.adInfo = (id, ret) => {
  Pole.findOne({
    "adScreen.id": id
  }, function (err, pole) {
    if (!err && pole) {
      ret.json({
        errcode: "2000",
        msg: "请求成功",
        totalCount: pole.adScreen.picLinks.length,
        picLinks : pole.adScreen.picLinks.map((e) => {
          return url_head + e;
        })
      });
    }
  })
}