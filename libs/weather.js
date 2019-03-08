const moment = require('moment');
const request = require('request');
const _ = require("underscore");
const Pole = require('../models/pole');

const appKey = 'c2f74c681235d2e3630000717f39cdbb';
const url = 'http://v.juhe.cn/weather';

const url_head = "http://139.159.254.213:3000/images/g2/40x40/day/";

exports.weatherInfo = (id, futureDay, ret) => {
  Pole.findOne({
    "adScreen.id": id
  }, function (err, pole) {
    if (!err && pole) {
      console.log(pole.adScreen.city);
      request({
        method: 'GET',
        url: url + '/index',
        qs: {
          cityname: pole.adScreen.city,
          key: appKey
        },
        strictSSL: false,
        json: true
      }, (err, res, body) => {
        if (!err && res.statusCode === 200) {
          let today = {
            "temperature": body.result.today.temperature,
            "weather": body.result.today.weather,
            "weather_id": _.mapObject(body.result.today.weather_id, function (val, key) {
              return url_head + val + ".png"
            }),
            "wind": body.result.today.wind,
            "week": body.result.today.week,
            "city": body.result.today.city,
            "date": body.result.today.date_y,
          };
          let futures = new Array();
          let index = 0;
          for (const day in body.result.future) {
            if (index == futureDay) break;
            if (body.result.future.hasOwnProperty(day) &&
              body.result.future[day].date !== moment().format("YYYYMMDD")) {
              futures.push(body.result.future[day]);
              index++;
            }
          }
          ret.json({
            errcode: "2000",
            msg: "请求成功",
            data: {
              realtime: pole.airBox.realtime,
              today: today,
              future: futures
            }
          });
        }
      });
    } else {
      ret.json({
        errcode: "1000",
        msg: "无效关联设备ID",
        timestamp: moment().format()
      })
    }
  });
}