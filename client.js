

var socket = require('socket.io-client')('http://127.0.0.1:3000');
socket.on('connect', function(){});
socket.on('event', function(data){});
socket.on('disconnect', function(){});

socket.on('other client',function(msg){
  process.stdout.write('\033c'); 
  console.log(msg)
});

socket.on('kick',function(code){
  if (code == '0') { 
    console.log('Thanks for playing!')
  } else {
    console.log('Opponent Left\nThanks for playing!')
  }
  process.exit()
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
