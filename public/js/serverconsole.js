/**
 * Created by dangu on 12/24/2015.
 */
$(document).ready(function () {
    //Retake
    $("#r2").hide();
    //Multi1v1
    $("#m2").hide();
});
var socket = io();
/////////////////////////////
//Retakes Server Functions
/////////////////////////////
var stream = false;
socket.on('rconresponse', function (data) {
    $('#console').append("<p>" + data + "</p>");
    var d = $('#console');
    d.scrollTop(d.prop("scrollHeight"));
});
socket.on('response', function (data) {
    if (stream) {
        $('#console').append("<p>" + data + "</p>");
        var d = $('#console');
        d.scrollTop(d.prop("scrollHeight"));
    }

});
function getstatus() {
    socket.emit('retakestatus');
}
function startretakestream() {
    stream = true;
    $("#r1").hide();
    $("#r2").show();

}
function stopretakestream() {
    stream = false;
    $("#r1").show();
    $("#r2").hide();
}
/////////////////////////////
//Multi1v1 Server Functions
/////////////////////////////
var streamtwo = false;
socket.on('rconresponsetwo', function (data) {
    $('#consoletwo').append("<p>" + data + "</p>");
    var d = $('#consoletwo');
    d.scrollTop(d.prop("scrollHeight"));
});
socket.on('multistatus', function (data) {
    if (streamtwo) {
        $('#consoletwo').append("<p>" + data + "</p>");
        var d = $('#consoletwo');
        d.scrollTop(d.prop("scrollHeight"));
    }

});
function getstatustwo() {
    socket.emit('multistatus');
}
function start1v1stream() {
    streamtwo = true;
    $("#m1").hide();
    $("#m2").show();

}
function stop1v1stream() {
    streamtwo = false;
    $("#m1").show();
    $("#m2").hide();
}