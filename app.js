var express = require('express');

var sassMiddleware = require('node-sass-middleware');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require("request");

var routes = require('./routes/index');
var users = require('./routes/users');
var gallery = require('./routes/gallery');
var item = require('./routes/item');
var contacts = require('./routes/contacts');
var about = require("./routes/about");
var search = require("./routes/search");

var breadcrumbs = require('express-breadcrumbs');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(sassMiddleware({
    src: 'public/sass',
    dest: path.join(__dirname, 'public/stylesheets'),
    debug: true,
    indentedSyntax: true,
    outputStyle:'compressed'
}));


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

/**
 * use breadcrumbs package
 */
app.use(breadcrumbs.init());
 
// Set Breadcrumbs home information 
app.use(breadcrumbs.setHome());
 
app.use('/', breadcrumbs.setHome({
  name: 'Головна',
  url: '/'
}));

app.use('/', routes);
app.use('/users', users);
app.use('/gallery', gallery);
app.use('/item', item);
app.use('/contacts', contacts);
app.use('/about', about);
app.use('/search', search);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;