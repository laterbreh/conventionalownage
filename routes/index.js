var express = require('express');
var router = express.Router();
var db = require('../models/db.js')
var SteamID = require('steamid');
var Gamedig = require('gamedig');
var async = require('async');
var servoptions = {

    type: 'csgo',
    host: '192.223.25.155',
    port: 27015

}
var serv2options = {
    type: 'csgo',
    host: 'coretakes1.game.nfoservers.com',
    port: 27015
}
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
            server2: results[4]
        });
    });

});


module.exports = router;
