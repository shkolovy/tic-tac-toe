/**
 * Created by artem on 17/02/2015.
 */

module.exports = function(server){
    var io = require('socket.io').listen(server),
        board = require('./tic-tac-toe'),
        users = {},
        games = {},
        gamesCount = 0,
        userCount = 0,
        COLORS = [
            '#428bca',
            '#5cb85c',
            '#5bc0de',
            '#f0ad4e'
        ];

    io.on('connection', onConnection);

    function onConnection(socket){
        console.log('connection ' + socket.id);

        userCount++;

        socket.on('disconnect', function () {
            console.log('disconnect ' + socket.id);

            leaveGame();
            userCount--;
            delete users[socket.id];
            socket.broadcast.emit('userLeft', {
                userName: socket.userName,
                time: new Date()
            });
            socket.broadcast.emit('updateUsersCount', userCount);
        });

        socket.on('newUser', function (userName){
            console.log('new user ' + userName);

            socket.userName = userName;
            users[socket.id] = {
                id: socket.id,
                name: userName,
                color: COLORS[Math.floor((Math.random() * 4))]
            };

            io.emit('userJoined', {
                user: users[socket.id],
                time: new Date()
            });

            socket.emit('refreshGameBoard', {
                games: games,
                gamesCount: gamesCount
            });

            io.emit('updateUsersCount', userCount);
        });

        socket.on('newMessage', function (data){
            console.log('new message');
            io.emit('showMessage', {
                message: data.message,
                user: users[data.userId],
                time: new Date()
            });
        });

        socket.on('newGame', function (){
            console.log('new Game by user ', socket.id);

            var id = Math.random();

            games[id] = {
               id: id,
               user1: users[socket.id],
               score1: 0,
               score2: 0,
               arena: new board()
            };

            gamesCount++;

            users[socket.id].gameId = id;

            io.to(socket.id).emit('updateGameResult', games[id]);

            io.emit('updateGameBoardLine', {
                game: games[id],
                gamesCount: gamesCount
            });

            socket.join('gameRoom' + id);

            console.log('new game ' + id);
        });

        socket.on('joinGame', function (data){
            console.log('join Game', data.gameId);

            var game = games[data.gameId],
                user = users[socket.id];

            game.user2 = user;
            game.startMatch = user;
            game.score1 = 0;
            game.score2 = 0;
            game.hasWinner = false;
            game.arena = new board();
            game.ready1 = false;
            game.ready2 = false;
            game.startMatch = user;

            users[socket.id].gameId = game.id;
            users[socket.id].opponentId = game.user1.id;
            users[game.user1.id].opponentId = socket.id;

            io.to(socket.id).emit('showNewGame', game);

            socket.join('gameRoom' + data.gameId);

            io.to('gameRoom' + data.gameId).emit('updateGameResult', game);

            io.to(game.user1.id).emit('userJoinGame', user);

            io.to('gameRoom' + game.id).emit('updateGameResult', game);

            io.emit('updateGameBoardLine', {
                game: game,
                gamesCount: gamesCount
            });
        });

        socket.on('playAgain', function (){
            var user = users[socket.id],
                game = games[user.gameId];

            if(user.id === game.user1.id){
                game.ready1 = true;
            }
            else {
                game.ready2 = true;
            }

            if(game.ready1 && game.ready2){
                game.startMatch = game.startMatch === user ? users[user.opponentId] : user;
                game.arena = new board();
                game.ready1 = false;
                game.ready2 = false;
                io.to('gameRoom' + game.id).emit('newMatch', game);
            }
        });

        socket.on('leaveGame', function (){
            leaveGame();
        });

        socket.on('move', function (move) {
            console.log('move: ' + move.x + ',' + move.y);

            var user = users[socket.id],
                game = games[user.gameId],
                opponent = users[user.opponentId],
                arena = game.arena,
                gameFinished = false;

            arena.move(move);

            gameFinished = arena.isGameFinished();

            console.log('game finished: ' + gameFinished);

            io.to(opponent.id).emit('showOpponentMove', {
                move: move,
                hasWinner: gameFinished
            });

            if(gameFinished){
                if(game.user1 === user){
                    game.score1++;
                }
                else{
                    game.score2++;
                }

                io.to('gameRoom' + game.id).emit('showMatchResult', {
                            isTie: false,
                            winner: user,
                            winCombination: arena.getWinCombination()
                        });

                io.emit('updateGameBoardLine', {
                    game: game,
                    gamesCount: gamesCount
                });

                io.to('gameRoom' + game.id).emit('updateGameResult', game);
            }
            else if(arena.isTie()){
                io.to('gameRoom' + game.id).emit('showMatchResult', { isTie: true });
            }
        });

        function leaveGame(){
            var user = users[socket.id],
                gameToLeave = user ? games[user.gameId] : null,
                gameToLeaveId = user ? user.gameId : null;

            if(gameToLeave){
                if(gameToLeave.user1 && gameToLeave.user1.id === socket.id){
                    gameToLeave.isRemoved = true;
                    delete games[gameToLeaveId];

                    gamesCount--;

                    if(gameToLeave.user2){
                        io.to(gameToLeave.user2.id).emit('serverUserLeftGame', user);
                    }
                }
                else if(gameToLeave.user2 && gameToLeave.user2.id === socket.id){
                    gameToLeave.user2 = undefined;
                    io.to(gameToLeave.user1.id).emit('userLeftGame', user);
                }

                io.emit('updateGameBoardLine', {
                    game: gameToLeave,
                    gamesCount: gamesCount
                });

                users[socket.id].gameId = null;
            }
        }
    }

    return io;
};