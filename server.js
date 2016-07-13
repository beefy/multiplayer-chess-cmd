var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Chess = require('chess.js').Chess;
var chess = new Chess();

function is_valid_move(msg_str) {
  return chess.moves().indexOf(msg_str.toString()) > -1;
}

io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('other client','new player has connected')
  socket.on('disconnect',function(){
    console.log('user disconnected');
    io.emit('other client','player has left the game'); 
  });
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    if (is_valid_move(msg)) { 
      chess.move(msg.toString()); 
      io.emit('other client',chess.ascii());
    } else {
      socket.emit('other client','invalid move!')
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
