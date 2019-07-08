const moment = require('moment');
const request = require('request');
const _ = require("underscore");
const Pole = require('../models/pole');

const appKey = '4b406925870a76031354d7aa6250cae9';
const url = 'http://v.juhe.cn/weather';

const url_head = "http://www.csiiot.com/images/g2/40x40/day/";
const GATHER_CYCLE = 6; // 六小时采集一次

exports.weatherInfo = (id, futureDay, ret) => {
  Pole.findOne({
    "adScreen.id": id
  }, function (err, pole) {
    if (!err && pole) {
      console.log(pole.adScreen.city);
      if (!pole.airBox.gatherTime ||
        moment(pole.airBox.gatherTime).add(GATHER_CYCLE, 'hours').isBefore(moment()) ||
        pole.airBox.today.city !== pole.adScreen.city) {
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
            console.log("Refresh a new data.")
            pole.airBox.today = {
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
            if (pole.airBox.gatherTime) {
              pole.airBox.future.splice(0, pole.airBox.future.length);
            }
            let index = 0;
            for (const day in body.result.future) {
              if (index == futureDay) break;
              if (body.result.future.hasOwnProperty(day) &&
                body.result.future[day].date !== moment().format("YYYYMMDD")) {
                pole.airBox.future.push(body.result.future[day]);
                index++;
              }
            }
            ret.json({
              errcode: "2000",
              msg: "请求成功",
              data: {
                realtime: pole.airBox.realtime,
                today: pole.airBox.today,
                future: pole.airBox.future
              }
            });
            pole.airBox.gatherTime = new Date();
            pole.save();
          }
        });
      } else {
        ret.json({
          errcode: "2000",
          msg: "请求成功",
          data: {
            realtime: pole.airBox.realtime,
            today: pole.airBox.today,
            future: pole.airBox.future
          }
        });
      }
    } else {
      ret.json({
        errcode: "1000",
        msg: "无效关联设备ID",
        timestamp: moment().format()
      })
    }
  });
}