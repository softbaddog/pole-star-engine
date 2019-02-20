const moment = require('moment');
const request = require('request');

const cityList = {
  "东莞": 2291
};
const appKey = '4b406925870a76031354d7aa6250cae9';
const url = 'http://v.juhe.cn/weather';
const future_day = 2;

request({
  method: 'GET',
  url: url + '/index',
  qs: {
    cityname: cityList['东莞'],
    key: appKey
  },
  strictSSL: false,
  json: true
}, (err, res, body) => {
  if (!err && res.statusCode === 200) {
    let today = {
      "temperature": body.result.today.temperature,
      "weather": body.result.today.weather,
      "weather_id": body.result.today.weather_id,
      "wind": body.result.today.wind,
      "week": body.result.today.week,
      "city": body.result.today.city,
      "date": body.result.today.date_y,
    };
    let futures = new Array();
    let index = 0;
    for (const day in body.result.future) {
      if (index == future_day) break;
      if (body.result.future.hasOwnProperty(day) &&
        body.result.future[day].date !== moment().format("YYYYMMDD")) {
        futures.push(body.result.future[day]);
        index++;
      }
    }
    console.log(JSON.stringify({
      errcode: "2000",
      msg: "请求成功",
      data: {
        realtime: {
          "temperature": "20.5℃",
          "humidity": "81.5rh%",
          "pressure": "9648hPa",
          "noise": "44.0db",
          "wind-speed": "0.0m/s",
          "wind-direction": "309°",
          "pm25": "51ug/m3"
        },
        today: today,
        future: futures
      }
    }, null, 2));
  } else {
    console.log(err, body);
  }
});