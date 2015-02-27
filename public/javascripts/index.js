/**
 * Created by artem on 15/02/2015.
 */

$(function(){
    var socket = io.connect(),
        userName = 'none',
        notificationStack = {"dir1": "up", "dir2": "left", "firstpos1": 25, "firstpos2": 25},

        $content = $('#content'),
        $userNameLbl = $('#userNameLbl'),
        $messagesLbl = $('#messagesLbl'),
        $messageTxt = $('#messageTxt'),
        $messageContainer = $('#messageContainer'),
        $usersOnlineCountLbl = $('#usersOnlineCountLbl'),
        $findGameContent = $('#findGameContent'),
        $gameAreaContent = $('#gameAreaContent'),
        $addMessageBtn = $('#addMessageBtn'),
        $createGameBtn = $('#createGameBtn'),
        $gameFieldLbl = $('#gameFieldLbl'),
        //$gameBoardLbl = $('#gameBoardLbl'),
        $leaveGameBtn = $('#leaveGameBtn'),
        $noGamesLbl = $('#noGamesLbl'),
        $gamesCountLbl = $('#gamesCountLbl'),
        $gameBoardLines = $('#gameBoardLines'),
        $user1NameLbl = $('#user1NameLbl'),
        $user2NameLbl = $('#user2NameLbl'),
        $user1ScoreLbl = $('#user1ScoreLbl'),
        $user2ScoreLbl = $('#user2ScoreLbl'),
        $gameInfoLbl = $('#gameInfoLbl'),
        $playAgainBtn = $('#playAgainBtn'),
        $gameOverlay = $('#gameOverlay');

    socket.on('updateUsersCount', function(count){
        $usersOnlineCountLbl.text(count);
    });

    socket.on('userLeft', function(data){
        console.log('user left ' + data.userName);

        $messagesLbl.append('<div><span class="text-muted">[' + getFormattedTime(data.time) +
        ']</span> <span style="color:#d9534f">' + data.userName + '</span> has left</div>');
    });

    socket.on('userJoined', function(data){
        console.log('user joined ' + data.name);

        if(data.user.id === socket.id){
            $messagesLbl.append('<div><span class="text-muted">[' + getFormattedTime(data.time) + ']</span> Welcome to chat ;)</div>');
        }
        else{
            $messagesLbl.append('<div><span class="text-muted">[' + getFormattedTime(data.time) + ']</span> <span style="color:'
            + data.user.color + '">' + data.user.name + '</span> has joined</div>');
        }
    });

    socket.on('showMessage', function(data){
        console.log('message from ' + (data.user.id === socket.id ? 'you' : data.user.name) + ': ' + data.message);
        $messagesLbl.append('<div><span class="text-muted">[' + getFormattedTime(data.time) + ']</span> <span style="color:' + data.user.color + '">' +
                            (data.user.id === socket.id ? 'you' : data.user.name) + '</span>: ' + data.message + '</div>');

        $messageContainer.animate({ scrollTop: $messagesLbl.height() }, 400);
    });

    socket.on('showNewGame', function(game){
        console.log('show new game ' + game.id);

        if(!game.user2){
            $gameOverlay.show();
            $gameInfoLbl.text('waiting for an opponent');
        }
        else{
            $gameOverlay.hide();
        }

        showGame();
    });

    socket.on('updateGameBoardLine', function(data){
        console.log('update Game Board ' + data.game.id);

        $gameBoardLines.toggle(data.gamesCount > 0);
        $noGamesLbl.toggle(data.gamesCount === 0);
        $gamesCountLbl.text(data.gamesCount);
        updateGameBoardLine(data.game);
    });

    socket.on('refreshGameBoard', function(data){
        console.log('refresh Game Board');

        $gameBoardLines.html('');
        $gamesCountLbl.text(data.gamesCount);
        $noGamesLbl.toggle(data.gamesCount === 0);
        $gameBoardLines.toggle(data.gamesCount > 0);

        console.log(data.templates);

        for (var property in data.games) {
            $gameBoardLines.append(buildGameBoardLine(data.games[property]));
        }
    });

    socket.on('serverUserLeftGame', function(user){
        console.log('server User Left');
        $gameOverlay.show();
        $gameInfoLbl.text('server left the game, leave the game');
        showNotification('user ' + user.name + 'left the game');
        //hideGame();
    });

    socket.on('updateGameResult', function(game){
        console.log('update game result');

        $user1NameLbl.text(game.user1.name).css('color', game.user1.color);
        $user1ScoreLbl.text(game.score1);

        if(game.user2){
            $user2NameLbl.text(game.user2.name).css('color', game.user2.color);
            $user2ScoreLbl.text(game.score2);
        }
        else{
            $user2NameLbl.text('-').css('color', '');
            $user2ScoreLbl.text('-');
        }
    });

    socket.on('userJoinGame', function(user){
        console.log('userJoinGame ' + user.name);
        showNotification('user ' + user.name + 'joined the game');
        $gameOverlay.hide();
    });

    socket.on('userLeftGame', function(user){
        console.log('userLeftGame ' + user.name);
        showNotification('user ' + user.name + 'left the game');
        $gameInfoLbl.text('user left the game, waiting for another');
        $gameOverlay.show();
    });

    socket.on('showMove', function(move) {
        console.log('opponent moved ' + move.x + ':' + move.y);
    });

    socket.on('showMatchResult', function(data) {
        console.log('match result ' + (data.isDraw ? 'tie' : data.winner.name));

        if(data.isDraw){
            $gameInfoLbl.text('tie');
        }
        else{
            $gameInfoLbl.text(data.winner.id === socket.id ? 'you won' : 'you lost');
        }

        $playAgainBtn.show();
        $gameOverlay.show();
    });

    function playAgain(){
        console.log('play again');
    }

    function showNotification(text){
        var n = new PNotify({
            text: text,
            shadow: false,
            icon: false,
            opacity: .8,
            addclass: 'stack-bottomright custom',
            stack: notificationStack,
            animate_speed: 400,
            animation: {
                'effect_in': 'drop',
                'options_in': 'linear',
                'effect_out': 'drop',
                'options_out': 'linear'
            }
        });

        n.get().click(function() {
            n.remove();
        });
    }

    function getFormattedTime(timeStr){
        var date = new Date(timeStr);
        return date.getHours() + ':' + date.getMinutes()
    }

    function updateGameBoardLine(game){
        var $existingGameLine = $gameBoardLines.find('*[data-game-id="'+ game.id +'"]');

        if(!game.isRemoved){
            var gameLine = buildGameBoardLine(game);

            if($existingGameLine.length > 0){
                $existingGameLine.replaceWith(gameLine);
            }
            else{
                $gameBoardLines.append(gameLine);
            }
        }
        else{
            $existingGameLine.remove();
        }
    }

    function buildGameBoardLine(game){
        return '<li class="list-group-item" data-game-id="' + game.id + '"><span style="color:' + game.user1.color + '">' + game.user1.name + '</span> <span class="text-muted">vs</span> ' +
            (game.user2 ? '<span style="color:' + game.user2.color + '">' + game.user2.name + '</span>' : '-') +
            (game.user2 ? '<span class="label label-info">'+ game.score1 + ' : ' + game.score2 +'</span>' :
            (game.user1.id === socket.id ? '' : '<button class="btn btn-default btn-xs">join</button>')) +
            '</li>';
    }

    function addMessage(){
        socket.emit('newMessage', {
            message: $messageTxt.val(),
            userId: socket.id
        });

        $messageTxt.val('');
    }

    function createNewGame(){
        //$createGameBtn.prop('disabled', true);
        socket.emit('newGame');
    }

    function leaveGame(){
        socket.emit('leaveGame');

        hideGame();
    }

    function joinGame(){
        var gameToJoinId = $(this).parent('li').data('game-id');

        socket.emit('joinGame', {
            gameId: gameToJoinId
        });

        showGame();
    }

    function showGame(){
        $findGameContent.fadeOut(400, function(){
            $gameAreaContent.show();
        });
    }

    function hideGame(){
        $gameAreaContent.fadeOut(400, function(){
            $findGameContent.show();
        });
    }

    function addMessageOnEnterClick(e) {
        var key = e.which;
        if(key == 13){
            if($(this).val().length > 0){
                $addMessageBtn.click();
                return false;
            }
        }
    }


    move = function(move){
        socket.emit('move', {
            x: move.x,
            y: move.y
        });
    }

    $addMessageBtn.on('click', addMessage);
    $createGameBtn.on('click', createNewGame);
    $gameBoardLines.on('click', 'button', joinGame);
    $leaveGameBtn.on('click', leaveGame);
    $messageTxt.on('keypress', addMessageOnEnterClick);
    $('[data-toggle="tooltip"]').tooltip();

    userName = prompt("Please enter your name", userName);

    $userNameLbl.text(', ' + userName + '!');
    socket.emit('newUser', userName);
    $content.fadeIn(900);
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

