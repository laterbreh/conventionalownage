'use strict';
var express = require('express');
var router = express.Router();
var db = require('../models/db.js');
var SteamID = require('steamid');
var Gamedig = require('gamedig');
var async = require('async');
var passport = require('passport');
var listenserver = require('../models/retakes.js');
var listenservertwo = require('../models/multione.js');
/* RCON CONFIGS */
let rcon = require('srcds-rcon')({
    address: '66.150.164.219',
    password: 'fH4iV3'
});
let rcontwo = require('srcds-rcon')({
    address: '192.223.25.155',
    password: 'JYiSMU'
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
    req.flash('dbaction', 'Query has been executed is being run on the server. Do not run this query more than once per 2 weeks.');
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
    if (req.user) { //change this to 1
        if(req.user.admin == 0){
            //console.log(req);
            console.log('Admin?: ');
            console.log(req.user.admin);
            return next();
        } else {
            console.log('Not admin');
            res.redirect('/login');
            return next();
        }
    } else {
        console.log('Not Authed');
        res.redirect('/login');
        return next();
    }

}

module.exports = function (io) {
    /*Socket.IO*/
    io.on('connection', function (socket) {
        listenservertwo.on('message', function (message, rinfo) {
            var msgtwo = message.toString('ascii').slice(5, -1);
            //console.log(msg);
            socket.emit('multistatus', msgtwo);
        });
        listenservertwo.on('listening', function () {
            var addresstwo = listenservertwo.address();
            console.log('UDP Server listening ' + addresstwo.address + ':' + addresstwo.port);
            var datatwo = 'UDP Server listening ' + addresstwo.address + ':' + addresstwo.port;
            socket.emit('multistatus', datatwo);

        });
        listenserver.on('message', function (message, rinfo) {
            var msg = message.toString('ascii').slice(5, -1);
            //console.log(msg);
            socket.emit('response', msg);
        });
        listenserver.on('listening', function () {
            var address = listenserver.address();
            console.log('UDP Server listening ' + address.address + ':' + address.port);
            var data = 'UDP Server listening ' + address.address + ':' + address.port;
            socket.emit('response', data);

        });
        //console.log('User has connected to Admin Page');
        //ON Events
        socket.on('retakercon', function(data){
            console.log('DATA');
            console.log(data);
            rcon.connect().then(() =>  rcon.command(data).then(data =>
                    //console.log(`got status ${sm}`)
                    socket.emit('rconresponse', `${data}`)
                )
            ).catch(err => {
                console.log('caught', err);
                console.log(err.stack);
                socket.emit('rconresponse', err);
            });
        });
        socket.on('multircon', function(data){
            console.log('Multi Rcon DATA');
            console.log(data);
            rcontwo.connect().then(() =>  rcontwo.command(data).then(data =>
                    //console.log(`got status ${sm}`)
                    socket.emit('rconresponsetwo', `${data}`)
                )
            ).catch(err => {
                console.log('caught', err);
                console.log(err.stack);
                socket.emit('rconresponsetwo', err);
            });
        });
        socket.on('retakestatus', function () {
            rcon.connect().then(() =>  rcon.command('status').then(status =>
                    //console.log(`got status ${sm}`)
                    socket.emit('rconresponse', `${status}`)
                )
            ).catch(err => {
                console.log('caught', err);
                console.log(err.stack);
            });
        });
        socket.on('multistatus', function () {
            rcontwo.connect().then(() =>  rcontwo.command('status').then(status =>
                    //console.log(`got status ${sm}`)
                    socket.emit('rconresponsetwo', `${status}`)
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