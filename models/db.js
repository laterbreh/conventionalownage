/**
 * Created by Reakt on 12/13/2015.
 */
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'conventionalownage.com',
    user     : 'conownage',
    password : 'twx5sBNr7m',
    database : 'conownage_mult1v1'
});
connection.connect(function(err){
    if(!err) {
        console.log('Connected to CO Database');
    } else {
        console.log('Error connecting to the DB:' + err);
    }
});

module.exports = connection;