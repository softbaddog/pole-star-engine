const moment = require('moment');
const _ = require('underscore');

const array = ['D', 'H', 'J'];
const newArry = array.concat(array);

console.log(newArry.splice(array.indexOf('J'), array.length));