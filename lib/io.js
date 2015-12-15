module.exports = function (io) {
    io.on('connection', function(){
        console.log('User connected... It works!');
    })
}