const _ = require('underscore');

var a = {
  name: 'moe',
  abc: {
    a: 1
  }
};

var b = {
  age: 50,
  abc: {
    b: 2
  }
}

console.log(_.extend(a.abc, b.abc));