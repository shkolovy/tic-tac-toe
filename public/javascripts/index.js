/**
 * Created by artem on 15/02/2015.
 */

$(function(){
    var socket = io.connect(),
        userName = 'none',
        $messagesLbl = $('#messagesLbl'),
        $messageTxt = $('#messageTxt'),
        $addMessageBtn = $('#addMessageBtn'),
        $createGameBtn = $('#createGameBtn'),
        $gameFieldLbl = $('#gameFieldLbl'),
        $gameBoardLbl = $('#gameBoardLbl'),
        $leaveGameBtn = $('#leaveGameBtn');

    socket.on('userLeft', function(userName){
        console.log('user left ' + userName);
    });

    socket.on('userJoined', function(userName){
        console.log('user joined ' + userName);
    });

    socket.on('showMessage', function(data){
        console.log('message from ' + (data.user.id === socket.id ? 'you' : data.user.name) + ': ' + data.message);
        $messagesLbl.append((data.user.id === socket.id ? 'you' : data.user.name) + ': ' + data.message + '<br>');
    });

    socket.on('showNewGame', function(id){
        console.log('show new game ' + id);

        $createGameBtn.hide();
        $leaveGameBtn.show();
        $gameFieldLbl.text('game #' + id);
    });

    socket.on('updateGameBoard', function(game){
        console.log('update Game Board ' + game.id);

        displayGameLine(game);
    });

    socket.on('fillGameBoard', function(games){
        console.log('fill Game Board');

        for (var property in games) {
            displayGameLine(games[property]);
        }
    });

    function displayGameLine(game){
        var gameLine = '<div data-game-id="' + game.id + '">' + game.user1.name + ' vs ' +
            (game.user2 ? game.user2.name : '-') +
            (game.user2 ? game.score1 + ':' + game.score2 : (game.user1.id === socket.id ? '' : '<button>join</button>')) +
            '</div>';

        var $existingGameLine = $gameBoardLbl.find('*[data-game-id="'+ game.id +'"]');

        if($existingGameLine.length > 0){
            $existingGameLine.html(gameLine);
        }
        else{
            $gameBoardLbl.append(gameLine);
        }
    }

    function addMessage(){
        socket.emit('newMessage', {
            message: $messageTxt.val(),
            userId: socket.id
        });

        $messageTxt.val('');
    }

    function newGame(){
        $createGameBtn.prop('disabled', true);
        socket.emit('newGame');
    }

    function joinGame(){
        var gameToJoinId = $(this).parent('div').data('game-id');

        console.log(socket.id);

        socket.emit('joinGame', {
            gameId: gameToJoinId
        });
    }

    $addMessageBtn.on('click',addMessage);
    $createGameBtn.on('click', newGame);
    $gameBoardLbl.on('click', 'button', joinGame);

    userName = prompt("Please enter your name", userName);

    socket.emit('newUser', userName);
});



//function askForName(){
//    userName = prompt("Please enter your name", userName);
//};
//
//socket.on('my message', function(data){
//    console.log(data);
//});
//
//socket.on('noAvailableSlots', function(data){
//    console.log('noAvailableSlots');
//});
//
//socket.on('waitingForAnotherUser', function(data){
//    console.log('waitingForAnotherUser');
//});
//
//socket.on('readyToStart', function(data){
//    console.log('readyToStart');
//    askForName();
//});




//(function(){
//    var socket = io.connect(),
//        //board = new Board(),
//        $moveBtn = $('#moveBtn'),
//        $moveXText = $('#moveXText'),
//        $moveYText = $('#moveYText'),
//        $movesLabel = $('#movesLabel'),
//        $boardLabel = $('#boardLabel'),
//        $nameLabel = $('#nameLabel');
//
//    var userName = 'none';
//
//    function init(){
//        socket.on('show', onShow);
//        socket.on('occupied', onOccupied);
//        socket.on('winner', onVictory);
//        socket.on('draw', onDraw);
//        socket.on('waitForUser', waitForUser);
//
//        $moveBtn.on('click', onMoveClick);
//        askForName();
//        $nameLabel.text(userName);
//    };
//
//    function askForName(){
//        userName = prompt("Please enter your name", userName);
//    };
//
//    function onMoveClick() {
//        var m = {
//                x: Number($moveXText.val()),
//                y: Number($moveYText.val())
//            };
//
//        move(m);
//    }
//
//    //events
//    function waitForUser(){
//        alert('wait for users');
//    };
//
//    function onOccupied(){
//        alert('occupied');
//    };
//
//    function onVictory(){
//        alert(userName + ' wins!');
//    };
//
//    function onDraw(){
//        alert('draw!');
//    };
//
//    function onShow(data){
//        $movesLabel.append('<p>user: ' + data.user + '</br>move: x:' + data.move.x + ', y:' + data.move.y + '</p>');
//
//        $boardLabel.html('');
//
//        console.log(data.board);
//
//        for(var i = 0; i < 3; i++){
//            for(var j = 0; j < 3; j++){
//                $boardLabel.append(data.board[i][j] === null ? '-' : (data.board[i][j] === 1 ? 'x' : 'o'));
//            }
//
//            $boardLabel.append('<br>');
//        }
//    };
//
//    function move(move){
//        socket.emit('move', {
//                user: userName,
//                move: move
//            });
//    };
//
//    $(init);
//}());



