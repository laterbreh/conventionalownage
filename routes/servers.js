var express = require('express');
var router = express.Router();
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

/* GET home page. */
router.get('/', function (req, res, next) {
    async.parallel([
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
        console.log(results[0]);
        console.log(results[1]);
        res.render('servers', {
            title: 'Express',
            data: results


        });
    });

});


module.exports = router;
