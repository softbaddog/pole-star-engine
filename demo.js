const moment = require('moment');
const _ = require('underscore');

let list = [{
  111: "one"
}, {
  222: "two"
}];

list.forEach(element => {
  console.log(element.111);
});
