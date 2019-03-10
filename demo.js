const moment = require('moment');
const _ = require('underscore');

let wake =
    (time) => {
      return new Promise(
          (resolve, reject) => {
              setTimeout(() => {resolve(`${time / 1000}秒后醒来`)}, time)})
    }

let [p1, p2, p3] = [wake(1000), wake(2000), wake(3000)];

let startTime = new Date();
Promise.all([p1, p2, p3])
    .then(
        (result) => {
            console.log(new Date() - startTime);
            console.log(result)  // [ '3秒后醒来', '2秒后醒来' ]
        })
    .catch((error) => {console.log(error)})