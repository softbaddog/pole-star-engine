const moment = require("moment");
const request = require("request");
const Pole = require("../models/pole");

const stationList = {
  16: "D",
  17: "H",
  18: "J",
  19: "E",
  20: "F",
  21: "G",
  22: "A",
  23: "B1",
  24: "B2",
  25: "云谷"
};

const TOKEN = "e10adc3949ba59abbe56e057f20f883e";
// const URL = 'https://hw.fpdiov.com/capp/line';
const URL = "https://hw.szyciov.com/app/line";

let getBusLocation = (station, line, maxShowBus, ratioDiff) => {
  console.log(station, line.id);
  return new Promise((resolve, reject) => {
    request(
      {
        method: "GET",
        url: URL + "/lineBusLocation",
        qs: {
          token: TOKEN,
          stationId: station,
          lineId: line.id
        },
        strictSSL: false,
        json: true
      },
      (err, res, body) => {
        if (!err && body && body.code == 200 && res.statusCode === 200) {
          let info = "车辆已收班";
          let busLocationList = [];
          let [hStart, mStart] = line.startTime.split(":");
          let [hEnd, mEnd] = line.endTime.split(":");
          let stationArr = line.stationArr.split(",");
          let sortArr = stationArr.concat(stationArr);
          let newArr = sortArr.splice(
            sortArr.indexOf(stationList[station]),
            stationArr.length
          );
          console.log(newArr);
          if (
            moment().isAfter(
              moment({
                hour: hStart,
                minute: mStart
              })
            ) &&
            moment().isBefore(
              moment({
                hour: hEnd,
                minute: mEnd
              }).add(1, "hour")
            )
          ) {
            for (const bus of body.data.busLocation) {
              busLocationList.push({
                time: bus.time == "" ? 0 : bus.time,
                nextStation: stationList[bus.nextStationId],
                nextStationRatio: bus.nextStationRatio,
                busNum: 1
              });
            }
            busLocationList.sort((first, second) => {
              return (
                newArr.indexOf(first.nextStation) -
                newArr.indexOf(second.nextStation)
              );
            });
            busLocationList.sort((first, second) => {
              if (first.nextStation == second.nextStation) {
                return first.nextStationRatio - second.nextStationRatio;
              }
            });
            let emergeNaborBus = (elem, index, array) => {
              if (
                index == array.length - 1 ||
                array[index + 1].nextStation != elem.nextStation
              )
                return;
              if (
                array[index + 1].nextStationRatio - elem.nextStationRatio <=
                ratioDiff
              ) {
                elem.busNum++;
                array.splice(index + 1, 1);
                emergeNaborBus(elem, index, array);
              }
            };
            busLocationList.forEach(emergeNaborBus);
            console.log(busLocationList);
            if (busLocationList[0].nextStation == stationList[station]) {
              if (
                // busLocationList[0].time == 0 &&
                busLocationList[0].nextStationRatio == 0
              ) {
                info = "车辆已抵达";
              } else if (
                busLocationList[0].nextStationRatio < 10 ||
                busLocationList[0].time < 60
              ) {
                info = "1分钟内抵达";
              } else if (
                busLocationList[0].nextStationRatio < 20 ||
                busLocationList[0].time < 120
              ) {
                info = "2分钟内抵达";
              } else {
                info = "大于2分钟，请稍等";
              }
            } else {
              info = "大于2分钟，请稍等";
            }
          }
          resolve({
            id: line.id,
            name: line.lineName,
            info: info,
            curr: stationList[station],
            stationArr: stationArr,
            startTime: line.startTime,
            endTime: line.endTime,
            busLocationList: busLocationList.slice(0, maxShowBus)
          });
        }
      }
    );
  });
};

exports.busStationInfo = (id, pageNo, pageSize, maxShowBus, ratioDiff, ret) => {
  Pole.findOne(
    {
      "adScreen.id": id
    },
    function(err, pole) {
      if (!err && pole) {
        console.log(stationList[pole.adScreen.station]);
        request(
          {
            method: "GET",
            url: URL + "/stationLineList",
            qs: {
              token: TOKEN,
              stationId: pole.adScreen.station
            },
            strictSSL: false,
            json: true
          },
          (err, res, body) => {
            if (!err && res.statusCode === 200) {
              let lineArr = [];
              for (const line of body.data) {
                lineArr.push(
                  getBusLocation(
                    pole.adScreen.station,
                    line,
                    maxShowBus,
                    ratioDiff
                  )
                );
              }
              Promise.all(lineArr).then(data => {
                data.sort(function(a, b) {
                  return a.id - b.id;
                });
                let start = pageNo * pageSize;
                let end = start + pageSize;
                ret.json({
                  errcode: "2000",
                  msg: "请求成功",
                  totalCount: lineArr.length,
                  pageNo: pageNo,
                  pageSize: pageSize,
                  station: stationList[pole.adScreen.station] + "区",
                  data: data.slice(start, end),
                  timestamp: moment().format()
                });
              });
            } else {
              console.log(err, body);
              ret.json({
                errcode: "1001",
                msg: "数据异常",
                timestamp: moment().format()
              });
            }
          }
        );
      } else {
        ret.json({
          errcode: "1000",
          msg: "无效关联设备ID",
          timestamp: moment().format()
        });
      }
    }
  );
};
