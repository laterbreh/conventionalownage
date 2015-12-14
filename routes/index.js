var express = require('express');
var router = express.Router();
var db = require('../models/db.js')
var SteamID = require('steamid');
var request = require('request');
var Gamedig = require('gamedig');
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

//Next challenge will be...
//Make it so when they click on a player in top 10, where it says your profile, make it pull up their results...
//http://www.sitepoint.com/creating-restful-apis-express-4/

router.route('/top10').get(function(req,res) {
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
//159107735
router.route('/getuser/:user').get(function(req,res){
    var user = req.params.user;
    console.log(user);
    db.query('SELECT * from multi1v1_stats WHERE name = ?', [user], function (err, results2, fields) {
        res.json(results2);
    });

});


/* GET home page. */
router.get('/', function (req, res, next) {
    db.query('select * from multi1v1_stats where rating > 1600 and lastTime > UNIX_TIMESTAMP(NOW() - INTERVAL 30 DAY) ORDER BY rating DESC LIMIT 10', function (err, results, fields) {
        if (err) throw err;
        for (var x = 0; x < results.length; ++x) {
            var sid = new SteamID(results[x].auth);
            //console.log(results[x]);
            results[x].auth = sid.getSteamID64();
        }
        //console.log('Pushing Top 10 players by rank, most active in last 30 days...');
        db.query('SELECT * from multi1v1_stats WHERE name = ?', ['THE GAIN TRAIN'], function (err, results2, fields) {
            //console.log(err);

            //console.log(results2[0]);
            var sid2 = new SteamID(results2[0].auth);
            results2[0].auth = sid2.getSteamID64();
            console.log(results2[0].auth);

            request('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=93E1B0BE72317A663278C695A1FF61EF&steamids=' + results2[0].auth, function (error, response, body) {
                if (!error) {
                    var body2 = JSON.parse(body);
                    console.log(body2.response.players[0].avatarmedium);
                    results2[0].imageurl = body2.response.players[0].avatarmedium;
                    db.query('select * from multi1v1_stats where lastTime > UNIX_TIMESTAMP(NOW() - INTERVAL 2 HOUR)', function (err, online, fields) {
                        Gamedig.query(servoptions, function(serv1data){
                            //console.log(serv1data);
                            if (!serv1data.hasOwnProperty('error')){
                                //console.log('good');
                                //console.log(serv1data);
                                //res.render('index', {title: 'Express', data: results, player: results2, online: online.length, server1: serv1data });
                                Gamedig.query(serv2options, function(serv2data){
                                    if (!serv2data.hasOwnProperty('error')){
                                        res.render('index', {title: 'Express', data: results, player: results2, online: online.length, server1: serv1data, server2: serv2data });
                                    } else {
                                        res.render('index', {title: 'Express', data: results, player: results2, online: online.length});
                                    }
                                });
                            } else {
                                //console.log('Not good')
                                res.render('index', {title: 'Express', data: results, player: results2, online: online.length});
                            }

                        });

                    });

                } else {
                    console.log(error);
                    console.log(results2);
                    //var online = getonlineplayers();
                    //console.log('ONLINE:' + getonlineplayers());
                    db.query('select * from multi1v1_stats where lastTime > UNIX_TIMESTAMP(NOW() - INTERVAL 2 HOUR)', function (err, online, fields) {
                        res.render('index', {title: 'Express', data: results, player: results2, online: online.length});
                    });

                }


            });


        });

    });

});



module.exports = router;
