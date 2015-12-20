/**
 * Created by Reakt on 12/13/2015.
 */
var mysql      = require('mysql');
//var connection = mysql.createConnection({
var connection = mysql.createPool({
    host     : 'conventionalownage.com',
    user     : 'conownage',
    password : 'twx5sBNr7m',
    database : 'conownage_mult1v1',
    connectionLimit : 100,
    acquireTimeout: 60000,
    waitForConnections : true,
    canRetry : true

});
//connection.connect(function(err){
connection.getConnection(function(err, connect){
    //connect.query('Select * from multi1v1_stats LIMIT 1', function (err, results) {
    //    console.log(results);
    //});
    if(!err) {
        console.log('Connected to CO Database');
    } else {
        console.log('Error connecting to the DB:' + err);
    }
});

module.exports = connection;