/**
 * Created by artem on 17/02/2015.
 */

module.exports = function(server){
    var io = require('socket.io').listen(server),
        board = require('./board'),
        users = {},
        boards = {},
        games = {};

    io.on('connection', onConnection);

    function onConnection(socket){
        console.log('connection ' + socket.id);

        socket.on('disconnect', function () {
            console.log('disconnect ' + socket.id);

            delete users[socket.id];
            socket.broadcast.emit('userLeft', socket.userName);
        });

        socket.on('newUser', function (userName){
            console.log('new user ' + userName);

            socket.userName = userName;
            users[socket.id] = {
                id: socket.id,
                name: userName
            };

            socket.broadcast.emit('userJoined', socket.userName);
            socket.emit('fillGameBoard', games);
        });

        socket.on('newMessage', function (data){
            console.log('new message');
            io.emit('showMessage', {
                message: data.message,
                user: users[data.userId]
            });
        });

        socket.on('newGame', function (){
            var id = Math.random();

            games[id] = {
               id: id,
               user1: users[socket.id],
               //board: new board()
               score1: 0,
               score2: 0
            };

            io.to(socket.id).emit('showNewGame', id);
            io.emit('updateGameBoard', games[id]);
            console.log('new game ' + id);
        });

        socket.on('joinGame', function (data){
            console.log('join Game', data);

            var game = games[data.gameId];
            game.user2 = users[socket.id];

            io.to(socket.id).emit('showNewGame', game.id);
            io.emit('updateGameBoard', game);
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