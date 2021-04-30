process.argv.splice(0, 2);

const server = process.argv.shift() || 'http://127.0.0.1:3000';
const socket = require('socket.io-client')(server);
socket.on('connect', () => {});
socket.on('event', () => {});
socket.on('disconnect', () => {});

socket.on('other client', (msg) => {
  process.stdout.write('\033c'); 
  console.log(msg)
});

socket.on('kick', (code) => {
  if (code == '0') { 
    console.log('Thanks for playing!')
  } else {
    console.log('Opponent Left\nThanks for playing!')
  }
  process.exit()
});

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  socket.emit('chat message',line);
})
