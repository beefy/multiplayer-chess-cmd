const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { Chess } = require('chess.js');
const chess = new Chess();

let white = -1;
let black = -1;
let turn = -1;
let not_turn = -1;
let last_move = -1;
let white_rematch = -1;
let black_rematch = -1;
let game_over = false;

function get_board(id) {
  if (id == white) return chess.ascii()
  return '  '+chess.ascii().split('').reverse().join('').substr(1);
}

io.on('connection', (socket) => {
  if (white == -1) {
    white = socket.id;
    console.log("white player connected: "+white);
    socket.emit('other client','Waiting for opponent to connect...')
  } else if (black == -1) {
    black = socket.id;
    turn = white;
    not_turn = black;
    console.log("black player connected: "+black);
    io.to(turn).emit('other client','Both players connected!\n\n'+get_board(turn)+'\n\nYour Move: ') 
    io.to(not_turn).emit('other client','Both players connected!\n\n'+get_board(not_turn)+'\n\nWaiting for opponent...') 
  }

  console.log('a user connected');
  socket.on('disconnect',() => {
    console.log('user disconnected');
    var leaveid = socket.id;
    if (leaveid == white) { leaveid = black; }
    else { leaveid = white; } 
    io.emit('other client','opponent has left the game\n\n'+get_board(leaveid)); 
  });
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    if (game_over) {
      if (msg != 'y' && msg != 'n') {
        socket.emit('other client','What?\n\n'+get_board(socket.id)+'\n\nRematch? (y/n)')
      } else {
        if (msg == 'n') {
	  io.to(socket.id).emit('kick','0')
	  io.emit('kick','1')
	  	
        }
        socket.emit('other client','Asking Opponent for Rematch...\n\n'+get_board(socket.id)+'\n\nWaiting for Opponent...') 
        if (socket.id == white) white_rematch = true;
	else if (socket.id == black) black_rematch = true;
	if (white_rematch != -1 && black_rematch != -1) {
	  chess = new Chess();
          game_over = false;
	  var tmp = white;
          white = black;
          black = tmp;
	  turn = white;
          not_turn = black;
	  io.to(turn).emit('other client','New Game!\n\n'+get_board(turn)+'\n\nYour Move: ')
          io.to(not_turn).emit('other client','New Game!\n\n'+get_board(turn)+'\n\nWaiting for opponent...') 
        } 
      } 
    } else if (turn != socket.id) {
      socket.emit('other client','it\'s not your turn!\n\n'+get_board(socket.id)+'\n\nWaiting for opponent...');
    } else if (chess.moves().indexOf(msg.toString()) > -1) { 
      chess.move(msg.toString());
      if (chess.game_over()) {
        game_over = true;
        io.to(white).emit('other client','Game Over!\n\n'+get_board(white)+'\n\nRematch? (y/n)')
        io.to(black).emit('other client','Game Over!\n\n'+get_board(black)+'\n\nRematch? (y/n)')
      } else {
        last_move = msg.toString(); 
        io.to(turn).emit('other client','You played: '+last_move+'\n\n'+get_board(turn)+'\n\nWaiting for opponent...')
        io.to(not_turn).emit('other client','Opponent played: '+last_move+'\n\n'+get_board(not_turn)+'\n\nYour Move: ') 
        var tmp = turn
        turn = not_turn
        not_turn = tmp
      }
    } else {
      socket.emit('other client','invalid move!\npossible moves: ' + chess.moves()+'\n\n'+get_board(socket.id))
    }
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
