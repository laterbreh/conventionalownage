'use strict';
var express = require('express');
var router = express.Router();
var db = require('../models/db.js');
var SteamID = require('steamid');
var Gamedig = require('gamedig');
var async = require('async');
var passport = require('passport');
/* Server Config for Retakes */
let rcon = require('srcds-rcon')({
    address: '66.150.164.219',
    password: 'fH4iV3'
});
/* Admin Page */
router.get('/', isLoggedIn, function (req, res) {
    res.render('admin', {
        user: req.user, // get the user out of session and pass to template
        title: 'Admin Page',
        message: req.flash('dbaction')
    });
});
/* Routes and Actions for admin panel */
router.get('/deleteinactive', isLoggedIn, function (req, res) {
    //Passport and create an admin page with socket.io that has a button for you to click this.
    db.query('DELETE from multi1v1_stats where lastTime < UNIX_TIMESTAMP(NOW() - INTERVAL 3 MONTH)', function (err, results1, fields) {
        //Delete all where the last time played is over 3 months ago
        console.log(results1.affectedRows);
        //console.log(new Date(results1[0].lastTime * 1000));
        req.flash('dbaction', 'Query was executed. Rows Affected: ' + results1.affectedRows);
        res.redirect('/admin');
    });
});
router.get('/antisquater', isLoggedIn, function (req, res) {
    req.flash('dbaction', 'Query Executed is being run on the server. Do not run this query more than once per 2 weeks.');
    res.redirect('/admin');
    db.query('SELECT accountID, name, rating, lastTime, TRUNCATE((unix_timestamp(NOW()) - lastTime) / 86400, 0) AS elapsedtime_days FROM multi1v1_stats WHERE rating > 1500 AND lastTime > 0 AND (unix_timestamp(NOW()) - lastTime) > 86400', function (err, results, fields) {
        console.log(results.length);
        var changes = 0;
        async.eachSeries(results, function (result, callback) {
            var accountid = results.accountID;
            var rating = result.rating;
            var lasttime = result.lastTime;
            var elapsed = result.elapsedtime_days;
            var ratingloss = (40 * elapsed * (rating - 1500) / rating);
            var ratingnew = (rating - ratingloss).toFixed(2);
            db.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query('UPDATE multi1v1_stats SET rating = ? WHERE accountID = ?', [ratingnew, accountid], function (err, resultsfinal) {
                    changes++;
                    connection.release();
                    //console.log(resultsfinal);
                    console.log(changes);
                    callback();
                });
            });
        }, function (err) {
            if (err) {
                console.log('ERROR RUNNING ANTI-SQUATER');
                console.log(err);
            } else {
                //What about socket emit to admin page when its done? :D
                console.log('DONE RUNNING ANTISQUATER');
            }
        });
    });
});

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.user.admin == 0) { //change this to 1
        //console.log(req);
        console.log('Admin?: ');
        console.log(req.user.admin);
        return next();
    } else {
        console.log('Not Authed');
        res.redirect('/login');
        return next();
    }

}

module.exports = function (io) {
    /*Socket.IO*/
    io.on('connection', function (socket) {
        //console.log('User has connected to Admin Page');
        //ON Events
        socket.on('retakestatus', function () {
            rcon.connect().then(() =>  rcon.command('status').then(status =>
                    //console.log(`got status ${sm}`)
                    socket.emit('response', `${status}`)
                )
            ).catch(err => {
                console.log('caught', err);
                console.log(err.stack);
            });

        });
        //End ON Events
    });
    return router;
};