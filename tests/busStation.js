const request = require('request');

const stationList = {
  16: 'D',
  17: 'H',
  18: 'J',
  19: 'E',
  20: 'F',
  21: 'G',
  22: 'A',
  23: 'B1',
  24: 'B2',
  25: '云谷'
}

const stationId = 21;
const token = 'e10adc3949ba59abbe56e057f20f883e';
const url = 'http://119.23.252.16:8090/app/line';
const pageNo = 0;
const pageSize = 4;
const maxShowBus = 4;
const ratioDiff = 25;

request({
  method: 'GET',
  url: url + '/stationLineList',
  qs: {
    token: token,
    stationId: stationId
  },
  strictSSL: false,
  json: true
}, (err, res, body) => {
  if (!err && res.statusCode === 200) {
    let data = new Array();
    let totalCount = 0;
    for (const line of body.data) {
      let lineId = line.id;
      totalCount++;
      request({
        method: 'GET',
        url: url + '/lineBusLocation',
        qs: {
          token: token,
          stationId: stationId,
          lineId: lineId
        },
        strictSSL: false,
        json: true
      }, (err, res, body) => {
        if (!err && res.statusCode === 200) {
          let busLocationList = new Array();
          let stationArr = line.stationArr.split(",");
          for (const bus of body.data.busLocation) {
            busLocationList.push({
              time: bus.time,
              nextStation: stationList[bus.nextStationId],
              nextStationRatio: bus.nextStationRatio,
              busNum: 1
            });
          }
          busLocationList.sort(function (a, b) {
            return (stationArr.indexOf(b.nextStation) - stationArr.indexOf(a.nextStation)) || (a.time - b.time);
          });
          busLocationList.forEach((elem, index, arr) => {
            if (index == arr.length - 1 || arr[index + 1].nextStation != elem.nextStation) return;
            if (arr[index + 1].nextStationRatio - elem.nextStationRatio <= ratioDiff) {
              elem.busNum++;
              arr.splice(index + 1, 1);
            }
          });
          data.push({
            id: line.id,
            stationArr: stationArr,
            startTime: line.startTime,
            endTime: line.endTime,
            busLocationList: busLocationList
          });
        }
      })
    }
    var timer = setInterval(() => {
      if (data.length == totalCount) {
        data.sort(function (a, b) {
          return a.id - b.id;
        });
        let start = pageNo * pageSize;
        let end = start + pageSize;
        console.log(JSON.stringify({
          errcode: "2000",
          msg: "请求成功",
          totalCount: totalCount,
          pageNo: pageNo,
          pageSize: pageSize,
          data: data.slice(start, end)
        }, null, 2));
        clearInterval(timer);
      }
    }, 10);
  } else {
    console.log(err, body);
  }
});