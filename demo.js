var _ = require('underscore');
var str = 'aa bb 00 00 30 f9 f2 fe fe fe fa ea bc'.replace(/ /g, '');
var buf = Buffer.from(str, 'hex')
console.log(buf.toString('hex').substr(0,8).toUpperCase());
