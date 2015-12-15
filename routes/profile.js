var express = require('express');
var router = express.Router();
var db = require('../models/db.js')
var SteamID = require('steamid');
var request = require('request');
router.route('/:user').get(function(req,res){
    var user = req.params.user;
    db.query('SELECT * from multi1v1_stats WHERE name = ?', [user], function (err, results, fields) {
        var sid = new SteamID(results[0].auth);
        console.log(results[0]);
        results[0].auth = sid.getSteamID64();
        request('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=93E1B0BE72317A663278C695A1FF61EF&steamids=' + results[0].auth, function (error, response, body) {
            if (!error) {
                var body2 = JSON.parse(body);
                console.log(body2.response.players[0].avatarfull);
                results[0].imageurl = body2.response.players[0].avatarfull;
                res.render('profile', {title: 'Express', data: results});
            } else {
                res.render('profile', {title: 'Express', data: results});
            }
        });

    });

});

module.exports = router;