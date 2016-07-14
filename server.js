var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Chess = require('chess.js').Chess;
var chess = new Chess();

var white = -1;
var black = -1;
var turn = -1;
var not_turn = -1;
var last_move = -1;

io.on('connection', function(socket){
  if (white == -1) {
    white = socket.id;
    console.log("white player connected: "+white);
    io.to(white).emit('other client','Waiting for opponent to connect...')
  } else if (black == -1) {
    black = socket.id;
    turn = white;
    not_turn = black;
    console.log("black player connected: "+black);
    io.to(turn).emit('other client','Both players connected!\n\n'+chess.ascii()+'\n\nYour Move: ') 
    io.to(not_turn).emit('other client','Both players connected!\n\n'+chess.ascii()+'\n\nWaiting for opponent...') 
  }

  console.log('a user connected');
  socket.on('disconnect',function(){
    console.log('user disconnected');
    io.emit('other client','opponent has left the game\n\n'+chess.ascii()); 
  });
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    if (turn != socket.id) {
      socket.emit('other client','it\'s not your turn!\n\n'+chess.ascii())
    } else if (chess.moves().indexOf(msg.toString()) > -1) { 
      chess.move(msg.toString());
      last_move = msg.toString(); 
      io.to(turn).emit('other client','You played: '+last_move+'\n\n'+chess.ascii()+'\n\nWaiting for opponent...')
      io.to(not_turn).emit('other client','Opponent played: '+last_move+'\n\n'+chess.ascii()+'\n\nYour Move: ') 
      var tmp = turn
      turn = not_turn
      not_turn = tmp
    } else {
      socket.emit('other client','invalid move!\npossible moves: ' + chess.moves()+'\n\n'+chess.ascii())
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
