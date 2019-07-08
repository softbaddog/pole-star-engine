const moment = require('moment');
const Pole = require('../models/pole');

const URL_AD = "http://www.csiiot.com/images/ad/"

exports.adInfo = (id, ret) => {
  Pole.findOne({
    "adScreen.id": id
  }, function (err, pole) {
    if (!err && pole) {
      ret.json({
        errcode: "2000",
        msg: "请求成功",
        totalCount: pole.adScreen.picLinks.length,
        picLinks: pole.adScreen.picLinks.map((e) => {
          return URL_AD + e;
        })
      });
    } else {
      ret.json({
        errcode: "1000",
        msg: "无效关联设备ID",
        timestamp: moment().format()
      })
    }
  })
}