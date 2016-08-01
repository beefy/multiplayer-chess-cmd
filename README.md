# multiplayer-chess-cmd
A personal chess server and client to play in the command line

The next step of this project is to minimize the bits that represent each move. This is important for large, professional chess servers to reduce resource load, but mostly I personally just wanted to see "how low I could go". I don't know if this is the smallest way to encode chess moves, but it is my attempt.

To start with, I got the server working through socketing the moves directly as they are in text ("e4","Qxe5", etc..). This is inefficent because each ascii character is 4 bytes, makeing each move 8-16 bytes, which is the number I will try to reduce. 

There are some "features" that need to be involved in a "complete" move encoding. I will try to include options for promoting a pawn to queen, knight, etc, as well as options for adding a new piece somewhere as needed in the varient "crazyhouse". Also, it should accommodate any unusual number of pieces, such as more than 8 pawns or two kings for whatever chess variant you could want.

The simplest encoding I could think of is the following:  
[kind of piece] [which piece] [where to move] [extra]

## Kind Of Piece

There are 6 pieces, so this takes up 3 bits

## Which Piece

If you order the squares on the board, you can identify which piece is which based on it's position in the ordering. This would mean the size of the move in bits is relational to how many of the same pieces are on the board. Luckily, you can tell from context how many of which piece is on the board, so you can expand the bits as necessary.

The size of this is variable, but if you moved the king, it would take no bits because you know which king (assuming there is only one) you moved. If it was a standard game and you moved a pawn, it would take 3 bits to count to eight. Bishop, knight, and rook would typically be one bit because there are typically two of each. If they get "eaten" as the game plays out, then the move size would decrease.

## Where to move

You can encode this piece by piece with relation to where it could ever possibly move. If a piece cannot move to all of it's possible spaces (ex. it is in a corner or surrounded by other pieces), we can know that by context and lower the expected bits accordingly. The array of possible vaild moves for each piece should be sorted consistently such that you only need to send the index of the valid move. If there are very few options to move the piece, like you are in check, there would be very few option bits to send with the move! If there is only one possible move, there are no bits to send because it is obvious!

- Bishop: 13 possible spaces - 4 bits max  
- Knight: 8 possible spaces - 3 bits max  
- Rook: 14 possible spaces - 4 bits max  
- Queen: 27 possible spaces - 5 bits max  
- King: 8 possible spaces - 3 bits max  
- Pawn: 3 possible spaces - 2 bits max  

## Extra

These extra bit(s) help keep this encoding modular. There should be some options to help meet the initial goals:

- a piece was "added" to the board, not moved, like in crazyhouse chess
- a piece was promoted

For adding, you just need one flag, and the rest can be assumed by the other bits (where to put the piece, what piece it is). There can be some more optimization here, but seeing as it's not a main goal, I'll leave it out for now.

For promoting a piece, you just need to know what piece you are promoting to, and the rest can be figured out by the other bits.

So you'll have one leading bit to determine if it's for promotion or adding, and then an optional 3 bits to determine which piece to promote to.

## Conclusion

[kind of piece] [which piece] [where to move] [extra]  
[3 bits] [0-3 bits] [0-5 bits] [0-4 bits] = 3-15 bits = 1-2 bytes

A plain ascii encoding is 8-16 bytes/move, whereas my encoding system is 1-2 bytes/move! That is 8 times better! In a large system, this could make a big impact to network effeciency and data storage. This system is not implemented, but I hope to do so if I find the time.
