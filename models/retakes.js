/**
 * Created by dangu on 12/19/2015.
 */
var dgram = require('dgram');
var listenserver = dgram.createSocket('udp4');
listenserver.bind(8006);
listenserver.on('listening', function () {
    var address = listenserver.address();
    console.log('UDP Server listening ' + address.address + ':' + address.port);
    //var data = 'UDP Server listening ' + address.address + ':' + address.port;
    //socket.emit('response', data);

});

module.exports = listenserver;