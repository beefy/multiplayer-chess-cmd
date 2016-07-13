

var socket = require('socket.io-client')('http://198.89.123.173:3000');
socket.on('connect', function(){});
socket.on('event', function(data){});
socket.on('disconnect', function(){});

socket.on('other client',function(msg){
  console.log(msg)
});

var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
  socket.emit('chat message',line);
})
