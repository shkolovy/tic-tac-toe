/**
 * Created by artem on 15/02/2015.
 */

$(function(){
    var ANIMATION_SPEED = 400,
        ENTER_KEY = 13,
        CROSS_CSS = 'cross',
        ZERO_CSS = 'zero',
        CHECKED_CSS = 'checked',
        CROSS_TURN_CSS = 'cross-turn',
        ZERO_TURN_CSS = 'zero-turn',

        socket = io.connect(),

        userName = 'none',
        isYourTurn = false,
        isUser1 = false,
        isCross = false,

        notificationStack = { "dir1": "up", "dir2": "left", "firstpos1": 25, "firstpos2": 25 },

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
        $user1Container = $('#user1Container'),
        $user2Container = $('#user2Container'),
        $gameFieldOverlay = $('#gameFieldOverlay'),
        $gameFieldBlockTurnOverlay = $('#gameFieldBlockTurnOverlay');

    //events
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
        $gameFieldOverlay.show();
        $gameInfoLbl.text('server left the game, leave the game');
        showNotification('user ' + user.name + 'left the game');
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

        //if(game.user1.id === socket.id){
        //    $user1NameLbl.text('you').css('color', game.user1.color);
        //    $user1ScoreLbl.text(game.score1);
        //
        //    if(game.user2){
        //        $user2NameLbl.text(game.user2.name).css('color', game.user2.color);
        //        $user2ScoreLbl.text(game.score2);
        //    }
        //    else{
        //        $user2NameLbl.text('-').css('color', '');
        //        $user2ScoreLbl.text('-');
        //    }
        //}
        //else {
        //    $user1NameLbl.text('you').css('color', game.user2.color);
        //    $user1ScoreLbl.text(game.score2);
        //
        //    $user2NameLbl.text(game.user1.name).css('color', game.user1.color);
        //    $user2ScoreLbl.text(game.score1);
        //}

    });

    socket.on('userJoinGame', function(user){
        console.log('userJoinGame ' + user.name);

        showNotification('user ' + user.name + 'joined the game');
        $gameFieldOverlay.hide();
        $gameFieldBlockTurnOverlay.show();
    });

    socket.on('userLeftGame', function(user){
        console.log('userLeftGame ' + user.name);

        showNotification('user ' + user.name + 'left the game');
        $gameInfoLbl.text('user left the game, waiting for another');
        $gameFieldOverlay.show();
    });

    socket.on('showOpponentMove', function(move) {
        console.log('opponent moved ' + move.x + ':' + move.y);

        isYourTurn = true;

        $gameFieldLbl.find('label[data-x=' + move.x + '][data-y=' + move.y + ']')
                    .addClass(CHECKED_CSS).addClass(isCross ? ZERO_CSS : CROSS_CSS);

        showWhoseTurn();
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
        $gameFieldOverlay.show();
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
            animate_speed: ANIMATION_SPEED,
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
        socket.emit('newGame');

        isCross = false;
        isUser1 = true;

        $gameFieldOverlay.show();
        $gameInfoLbl.text('waiting for an opponent');

        initGameField();
        showGameField();
    }

    function leaveGame(){
        socket.emit('leaveGame');

        hideGameField();
    }

    function joinGame(){
        var gameToJoinId = $(this).parent('li').data('game-id');

        socket.emit('joinGame', {
            gameId: gameToJoinId
        });

        isUser1 = false;
        isYourTurn = true;
        isCross = true;

        initGameField();
        showGameField();
    }

    function addMessageOnEnterClick(e) {
        var key = e.which;

        if(key == ENTER_KEY){
            if($(this).val().length > 0){
                $addMessageBtn.click();
                return false;
            }
        }
    }

    function move(){
        var $el = $(this);

        if($el.hasClass('checked')){
            return;
        }

        isYourTurn = false;

        socket.emit('move', {
            x: $el.data('x'),
            y: $el.data('y')
        });

        $(this).addClass(CHECKED_CSS).addClass(isCross ? CROSS_CSS : ZERO_CSS);

        showWhoseTurn();
    }

    //helper functions
    function showWhoseTurn(){
        $user1Container.find('.move-pointer').fadeToggle(isUser1 && isYourTurn);
        $user2Container.find('.move-pointer').fadeToggle(isUser1 && !isYourTurn);
        $gameFieldBlockTurnOverlay.toggle(!isYourTurn);
    }

    function initGameField(){
        $gameFieldLbl.toggleClass(ZERO_TURN_CSS, !isCross).toggleClass(CROSS_TURN_CSS, isCross);
    }

    function showGameField(){
        $findGameContent.fadeOut(ANIMATION_SPEED, function(){
            $gameAreaContent.show();
        });
    }

    function hideGameField(){
        $gameAreaContent.fadeOut(ANIMATION_SPEED, function(){
            $findGameContent.show();
        });
    }

    function clearGameArena(){
        $gameFieldLbl.find('label').removeClass(CROSS_CSS).removeClass(ZERO_CSS);
    }

    //init ui controls
    $addMessageBtn.on('click', addMessage);
    $createGameBtn.on('click', createNewGame);
    $leaveGameBtn.on('click', leaveGame);
    $messageTxt.on('keypress', addMessageOnEnterClick);
    $gameBoardLines.on('click', 'button', joinGame);
    $gameFieldLbl.on('click', 'label', move);

    $('[data-toggle="tooltip"]').tooltip();

    userName = prompt("Please enter your name", userName);

    $userNameLbl.text(', ' + userName + '!');
    socket.emit('newUser', userName);
    $content.fadeIn(ANIMATION_SPEED);
});