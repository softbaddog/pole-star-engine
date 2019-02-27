const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const multiparty = require('connect-multiparty');

const cfg = require('./iotplatform/config');
const auth = require('./iotplatform/auth');
const sub = require('./iotplatform/sub');
const dis = require('./iotplatform/dis');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const airBox = require('./libs/airBox');

const app = express();

mongoose.connect('mongodb://localhost/polestar', {
  useNewUrlParser: true,
  useCreateIndex: true
});

mongoose.connection.once('open', () => {
  console.log("MongoDB connected success.");
  if (cfg.mode == 'hub') {
    dis.load();
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(multiparty({
  uploadDir: './public/images'
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.locals.moment = require('moment');

auth.fetchAccessToken().then((loginInfo) => {
  if (cfg.mode == 'platform') {
    console.log("subscribe is coming...");
    // TODO 如果清除失败，也要进行订阅
    sub.cleanAllSub(loginInfo).then(
      () => {
        for (const item of sub.notifyTypeList) {
          if (item.enabled) {
            sub.subscribe(loginInfo, item.notifyType);
          }
        }
      }
    );
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;