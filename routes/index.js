var express = require('express');
var router = express.Router();
var db = require('../models/db.js');
var SteamID = require('steamid');
var Gamedig = require('gamedig');
var async = require('async');
var passport = require('passport');
var servoptions = {

    type: 'csgo',
    host: '192.223.25.155',
    port: 27015

};
var serv2options = {
    type: 'csgo',
    host: 'coretakes1.game.nfoservers.com',
    port: 27015
};

//Going to create an admin page for managing the DB. Set up
//Passport and create an admin page with socket.io that has a button for you to click this.
//db.query('select * from multi1v1_stats where lastTime < UNIX_TIMESTAMP(NOW() - INTERVAL 3 MONTH)', function (err, results1, fields) {
//    //Delete all where the last time played is over 3 months ago
//   console.log(results1.length);
//    console.log(new Date(results1[0].lastTime * 1000));
//});
/* GET Top 10 as JSON Response. */
router.route('/top10').get(function (req, res) {
    db.query('select * from multi1v1_stats where rating > 1600 and lastTime > UNIX_TIMESTAMP(NOW() - INTERVAL 30 DAY) ORDER BY rating DESC LIMIT 10', function (err, results, fields) {
        if (err) throw err;
        for (var x = 0; x < results.length; ++x) {
            var sid = new SteamID(results[x].auth);
            //console.log(results[x]);
            results[x].auth = sid.getSteamID64();
        }
        res.json(results);
    });
});
/* Login Stuff */
router.get('/login', function (req, res) {

    // render the page and pass in any flash data if it exists
    res.render('login.ejs', {message: req.flash('loginMessage'), title: 'Login'});
});
router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }),
    function (req, res) {
        console.log("hello");

        if (req.body.remember) {
            req.session.cookie.maxAge = 1000 * 60 * 3;
        } else {
            req.session.cookie.expires = false;
        }
        res.redirect('/');
    });
router.get('/signup', function (req, res) {
    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', {message: req.flash('signupMessage'), title: 'Sign-Up'});
});
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));
/* Admin Page */
router.get('/admin', isLoggedIn, function (req, res) {
    res.render('admin', {
        user: req.user, // get the user out of session and pass to template
        title: 'Admin Page'
    });
});
/* Logout */
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});
/* GET home page. */
router.get('/', function (req, res, next) {
    async.parallel([
        function (callback) {
            db.query('select * from multi1v1_stats where rating > 1600 and lastTime > UNIX_TIMESTAMP(NOW() - INTERVAL 30 DAY) ORDER BY rating DESC LIMIT 10', function (err, results1, fields) {
                if (err) throw err;
                for (var x = 0; x < results1.length; ++x) {
                    var sid = new SteamID(results1[x].auth);
                    //console.log(results[x]);
                    results1[x].auth = sid.getSteamID64();

                }
                callback(null, results1);
            });
        },
        function (callback) {
            db.query('SELECT * from multi1v1_stats ORDER BY rating ASC LIMIT 10', function (err, results2, fields) {
                if (err) throw err;
                for (var x = 0; x < results2.length; ++x) {
                    var sid = new SteamID(results2[x].auth);
                    results2[x].auth = sid.getSteamID64();
                }
                var sid2 = new SteamID(results2[0].auth);
                results2[0].auth = sid2.getSteamID64();
                //console.log(results2[0].auth);
                callback(null, results2);
            });
        }, function (callback) {
            db.query('select * from multi1v1_stats where lastTime > UNIX_TIMESTAMP(NOW() - INTERVAL 2 HOUR)', function (err, online, fields) {
                //console.log('ONELINE: ' + online.length);
                callback(null, online);
            });
        },
        function (callback) {
            Gamedig.query(servoptions, function (serv1data) {
                callback(null, serv1data);
            });
        },
        function (callback) {
            Gamedig.query(serv2options, function (serv2data) {
                callback(null, serv2data);
            });
        }
    ], function (err, results) {
        res.render('index', {
            title: 'Express',
            data: results[0],
            player: results[1],
            online: results[2].length,
            server1: results[3],
            server2: results[4],
            user: req.user
        });
    });

});

//Route Middleware for verification
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.user.admin == 0) { //change this to 1
        //console.log(req);
        console.log('Admin?: ');
        console.log(req.user.admin);
        return next();
    } else {
        console.log('Not Authed');
        res.redirect('/');
        return next();
    }

}
module.exports = function (io) {
    //Socket.IO
    io.on('connection', function (socket) {
        console.log('User has connected to Webpage');
        //ON Events
        socket.on('test', function () {
            console.log('Successful Socket Test');
        });
        //End ON Events
    });
    return router;
};

//module.exports = router;

