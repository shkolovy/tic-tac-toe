/**
 * Created by artem on 17/02/2015.
 */

module.exports = function(server){
    var io = require('socket.io').listen(server),
        board = require('./board'),
        users = {},
        boards = {},
        games = {},
        gamesCount = 0,
        userCount = 0;

    io.on('connection', onConnection);

    function onConnection(socket){
        console.log('connection ' + socket.id);

        userCount++;

        socket.on('disconnect', function () {
            console.log('disconnect ' + socket.id);

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
                name: userName
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
               score2: 0
            };

            gamesCount++;

            users[socket.id].gameId = id;

            io.to(socket.id).emit('showNewGame', id);
            io.emit('updateGameBoardLine', {
                game: games[id],
                gamesCount: gamesCount
            });
            console.log('new game ' + id);
        });

        socket.on('joinGame', function (data){
            console.log('join Game', data.gameId);

            var game = games[data.gameId];
            game.user2 = users[socket.id];

            users[socket.id].gameId = game.id;

            io.to(socket.id).emit('showNewGame', game.id);

            io.emit('updateGameBoardLine', {
                game: game,
                gamesCount: gamesCount
            });
        });

        socket.on('leaveGame', function (){
            var gameToLeaveId = users[socket.id].gameId,
                gameToLeave = games[gameToLeaveId];

            if(gameToLeave.user1 && gameToLeave.user1.id === socket.id){
                gameToLeave.isRemoved = true;
                delete games[gameToLeaveId];

                gamesCount--;

                if(gameToLeave.user2){
                    io.to(gameToLeave.user2.id).emit('serverUserLeft');
                }
            }
            else if(gameToLeave.user2 && gameToLeave.user2.id === socket.id){
                gameToLeave.user2 = undefined;
            }

            io.emit('updateGameBoardLine', {
                game: gameToLeave,
                gamesCount: gamesCount
            });
        });
    }

    return io;
};




//var users = [null, null];
//
//io.on('connection', function(socket){
//    console.log('connection ' + socket.id);
//
//    socket.on('disconnect', function(id) {
//        console.log('disconnect ' + socket.id);
//
//        users[users.indexOf(socket.id)] = null;
//    });
//
//    if(!users[0]){
//        users[0] = socket.id;
//        socket.join('game');
//
//        if(!users[1]){
//            io.to(socket.id).emit('waitingForAnotherUser');
//            console.log('waitingForAnotherUser')
//        }
//    }
//    else if(!users[1]){
//        users[1] = socket.id;
//
//        socket.join('game');
//
//        if(!users[0]){
//            io.to(socket.id).emit('waitingForAnotherUser');
//            console.log('readyToStart')
//        }
//    }
//    else{
//        io.to(socket.id).emit('noAvailableSlots');
//        console.log('no available slots')
//    }
//
//    if(users[0] && users[1]){
//        io.to('game').emit('readyToStart');
//    }
//
//    socket.on('say to someone', function(msg){
//        console.log('say to someone ' + socket.id);
//        var userToSay;
//
//        if(users[0] === socket.id){
//            userToSay = users[1];
//        }
//        else{
//            userToSay = users[0];
//        }
//
//        io.to(userToSay).emit('my message', msg);
//    });
//});