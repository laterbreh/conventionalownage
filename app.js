//TO DO:
//http://mherman.org/blog/2015/01/31/local-authentication-with-passport-and-express-4/#.VnEJFfkrKUl
//https://github.com/manjeshpv/node-express-passport-mysql
//https://github.com/mjhea0/passport-local-express4
//Once you get this working ^^ -> Make an admin page with various DB calls to clean etc....
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();
app.io = require('socket.io')();
//Passport Stuff
var passport = require('passport');
var flash = require('connect-flash');
require('./passport/passport')(passport);
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'vidyapathaisalwaysrunning',
    resave: true,
    saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


var routes = require('./routes/index')(app.io, passport);
var admin = require('./routes/admin')(app.io, passport);
var profile = require('./routes/profile');
var servers = require('./routes/servers');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/admin', admin);
app.use('/profile', profile);
app.use('/servers', servers);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

console.log('Still works?')

module.exports = app;

