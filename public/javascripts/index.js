/**
 * Created by artem on 15/02/2015.
 */

$(function(){
    var ANIMATION_SPEED = 400,
        HIGHLIGHT_DURATION = 1000,
        NOTIFY_MOVE_TIME = 3000,
        ENTER_KEY = 13,
        CROSS_CSS = 'cross',
        ZERO_CSS = 'zero',
        CHECKED_CSS = 'checked',
        CROSS_TURN_CSS = 'cross-turn',
        ZERO_TURN_CSS = 'zero-turn',

        socket = io.connect(),

        moveTimeOut,

        userName,
        isYourTurn = false,
        isUser1 = false,
        isCross = false,

        stack_topright = {"dir1": "down", "dir2": "left", "push": "top", "firstpos1": 25, "firstpos2": 25},

        $content = $('#content'),
        $welcome = $('#welcome'),
        $userNameTxt = $('#userNameTxt'),
        $userNameContainer = $('#userNameContainer'),
        $userNameLbl = $('#userNameLbl'),
        $messagesContent = $('#messagesContent'),
        $messageTxt = $('#messageTxt'),
        $messageContainer = $('#messageContainer'),
        $usersOnlineCountLbl = $('#usersOnlineCountLbl'),
        $gameListContainer = $('#gameListContainer'),
        $gameArenaContainer = $('#gameArenaContainer'),
        $createGameBtn = $('#createGameBtn'),
        $gameArenaContent = $('#gameArenaContent'),
        $leaveGameBtn = $('#leaveGameBtn'),
        $noGamesLbl = $('#noGamesLbl'),
        $gamesCountLbl = $('#gamesCountLbl'),
        $gameListContent = $('#gameListContent'),
        $user1NameLbl = $('#user1NameLbl'),
        $user2NameLbl = $('#user2NameLbl'),
        $user1ScoreLbl = $('#user1ScoreLbl'),
        $user2ScoreLbl = $('#user2ScoreLbl'),
        $user1MovePointer = $('#user1MovePointer'),
        $user2MovePointer = $('#user2MovePointer'),
        $gameInfoLbl = $('#gameInfoLbl'),
        $playAgainBtn = $('#playAgainBtn'),
        $gameArenaContentOverlay = $('#gameArenaContentOverlay'),
        $gameArenaContentTurnOverlay = $('#gameArenaContentTurnOverlay');

    //events
    socket.on('updateUsersCount', function(count){
        log(count, 'updateUsersCount');

        $usersOnlineCountLbl.text(count);
    });

    socket.on('userLeft', function(data){
        log(data.userName, 'userLeft');

        $messagesContent.append('<div><span class="text-muted">[' + getFormattedTime(data.time) +
        ']</span> <span style="color:#d9534f">' + data.userName + '</span> has left</div>');
    });

    socket.on('userJoined', function(data){
        log(data.user.name, 'userJoined');

        if(data.user.id === socket.id){
            $messagesContent.append('<div><span class="text-muted">[' + getFormattedTime(data.time) + ']</span> Welcome to chat ;)</div>');
        }
        else{
            $messagesContent.append('<div><span class="text-muted">[' + getFormattedTime(data.time) + ']</span> <span style="color:'
            + data.user.color + '">' + data.user.name + '</span> has joined</div>');
        }
    });

    socket.on('showMessage', function(data){
        log((data.user.id === socket.id ? 'you' : data.user.name) + ': ' + data.message, 'showMessage');

        $messagesContent.append('<div><span class="text-muted">[' + getFormattedTime(data.time) + ']</span> <span style="color:' + data.user.color + '">' +
                            (data.user.id === socket.id ? 'you' : data.user.name) + '</span>: ' + data.message + '</div>');

        $messageContainer.animate({ scrollTop: $messagesContent.height() }, 400);
    });

    socket.on('updateGameBoardLine', function(data){
        log(data.game.id, 'updateGameBoardLine');

        $gameListContent.toggle(data.gamesCount > 0);
        $noGamesLbl.toggle(data.gamesCount === 0);
        $gamesCountLbl.text(data.gamesCount);
        updateGameBoardLine(data.game);
    });

    socket.on('refreshGameBoard', function(data){
        log(null, 'refreshGameBoard');

        $gameListContent.html('');
        $gamesCountLbl.text(data.gamesCount);
        $noGamesLbl.toggle(data.gamesCount === 0);
        $gameListContent.toggle(data.gamesCount > 0);

        for (var property in data.games) {
            $gameListContent.append(buildGameBoardLine(data.games[property]));
        }
    });

    socket.on('updateGameResult', function(game){
        log('score ' + game.score1 + ':' + game.score2, 'updateGameResult');

        $user1NameLbl.text(game.user1.name).css('color', game.user1.color);

        if(game.user2){
            $user2NameLbl.text(game.user2.name).css('color', game.user2.color);
            $user2ScoreLbl.text(game.score2);
            $user1ScoreLbl.text(game.score1);
        }
        else{
            $user2NameLbl.text('-').css('color', '');
            $user2ScoreLbl.text('-');
            $user1ScoreLbl.text('-');
        }
    });

    socket.on('userJoinGame', function(user){
        log(user.name, 'userJoinGame');

        toggleDropElement($user2MovePointer);
        showNotification(user.name + ' has joined the game');
        hideGameArenaOverlay();
        clearGameArenaContent();

        $gameArenaContentTurnOverlay.show();
    });

    socket.on('serverUserLeftGame', function(user){
        log(user.name, 'serverUserLeftGame');

        showGameFieldOverlay('Opponent has left the game, join another or start your own', false);

        showNotification('User ' + user.name + 'has left the game');
        hideTurnIndicators();
    });

    socket.on('userLeftGame', function(user){
        log(user.name, 'userLeftGame');

        showNotification(user.name + ' has left the game');
        showGameFieldOverlay('User has left the game, waiting for another', false);
        hideTurnIndicators();
    });

    socket.on('showOpponentMove', function(data) {
        log('move ' + data.move.x + ':' + data.move.y, 'showOpponentMove');

        isYourTurn = true;

        $gameArenaContent.find('label[data-x=' + data.move.x + '][data-y=' + data.move.y + ']')
                    .addClass(CHECKED_CSS).addClass(isCross ? ZERO_CSS : CROSS_CSS);

        if(data.hasWinner){
            $gameArenaContentTurnOverlay.show();
        }
        else{
            showWhoseTurn();
            notifyAboutMove();
        }
    });

    socket.on('showMatchResult', function(data) {
        log((data.isTie ? 'tie' : data.winner.name), 'showMatchResult');

        var message;

        if(data.isTie){
            message = 'tie';
        }
        else{
            $.each(data.winCombination, function(i, move){
                var $el = $gameArenaContent.find('label[data-x=' + move.x + '][data-y=' + move.y + ']');

                $el.css('transition' , 'none');
                $el.effect("highlight", {}, HIGHLIGHT_DURATION, function(){
                    $el.css('transition' , '');
                });
            });

            message = data.winner.id === socket.id ? 'You Won' : 'You Lost';
        }

        hideTurnIndicators();

        //block game arena after winning animation
        setTimeout(function(){
            showGameFieldOverlay(message, true);
        }, HIGHLIGHT_DURATION + 100);
    });

    socket.on('newMatch', function(game) {
        log(null, 'newMatch');

        if(game.startMatch.id === socket.id){
            isYourTurn = true;
            $gameArenaContentTurnOverlay.hide();
            toggleDropElement(isUser1 ? $user1MovePointer : $user2MovePointer);
        }
        else{
            isYourTurn = false;
            toggleDropElement(isUser1 ? $user2MovePointer : $user1MovePointer);
        }

        isCross = !isCross;
        clearGameArenaContent();
        initGameArena();
        hideGameArenaOverlay();
    });

    function playAgain(){
        log('you', 'playAgain', true);

        showGameFieldOverlay('Waiting for opponent response', false);

        socket.emit('playAgain');
    }

    function showNotification(text){
        var n = new PNotify({
            stack: stack_topright,
            text: text,
            shadow: false,
            icon: false,
            opacity: .9,
            addclass: 'custom',
            animate_speed: ANIMATION_SPEED,
            animation: {
                'effect_in': 'drop',
                'options_in': 'easeOutElastic',
                'effect_out': 'drop',
                'options_out': 'easeOutElastic'
            }
        });

        n.get().click(function() {
            n.remove();
        });
    }

    function getFormattedTime(timeStr){
        var date = new Date(timeStr);
        return date.toTimeString().replace(/(\d{2}:\d{2}).*/, "$1");
    }

    function updateGameBoardLine(game){
        var $existingGameLine = $gameListContent.find('*[data-game-id="'+ game.id +'"]');

        if(!game.isRemoved){
            var gameLine = buildGameBoardLine(game);

            if($existingGameLine.length > 0){
                $existingGameLine.replaceWith(gameLine);
            }
            else{
                $gameListContent.append(gameLine);
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
        log('you send: ' + $messageTxt.val(), 'newMessage', true);

        socket.emit('newMessage', {
            message: $messageTxt.val(),
            userId: socket.id
        });

        $messageTxt.val('');
    }

    function createNewGame(){
        log('you', 'newGame', true);

        socket.emit('newGame');

        isCross = false;
        isUser1 = true;

        showGameFieldOverlay('Waiting for opponent', false);
        hideTurnIndicators();
        initGameArena();
        showGameArena();
    }

    function leaveGame(){
        log('you', 'leaveGame', true);

        socket.emit('leaveGame');

        hideGameArena();
        clearGameArenaContent();
    }

    function joinGame(){
        var gameToJoinId = $(this).parent('li').data('game-id');

        socket.emit('joinGame', {
            gameId: gameToJoinId
        });

        isUser1 = false;
        isYourTurn = true;
        isCross = true;

        $user1MovePointer.hide();
        $user2MovePointer.show();

        $gameArenaContentTurnOverlay.hide();
        hideGameArenaOverlay();
        notifyAboutMove();
        initGameArena();
        showGameArena();
    }

    function enterNameOnEnterClick(e){
        var key = e.which,
            $el = $(this);

        if(key == ENTER_KEY){
            if($el.val().length > 0){
                userName = $el.val();

                $userNameLbl.text(', ' + userName + '!');
                socket.emit('newUser', userName);

                $welcome.fadeOut(ANIMATION_SPEED);
                $content.fadeIn(ANIMATION_SPEED);

                return false;
            }
            else{
                shakeElement($userNameContainer);
            }
        }
    }

    function addMessageOnEnterClick(e) {
        var key = e.which;

        if(key == ENTER_KEY){
            if($(this).val().length > 0){
                addMessage();
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

        clearTimeout(moveTimeOut);

        $(this).addClass(CHECKED_CSS).addClass(isCross ? CROSS_CSS : ZERO_CSS);

        showWhoseTurn();
    }

    //helper functions
    function shakeElement(el){
        el.effect("shake", {distance: '10', times: '3'} );
    }

    function toggleDropElement(el){
        el.toggle("drop", {direction: 'up'} );
    }

    function notifyAboutMove(){
        if (moveTimeOut) {
            clearTimeout(moveTimeOut);
        }

        moveTimeOut = setTimeout(function () {
            shakeElement(isUser1 ? $user1MovePointer : $user2MovePointer);
        }, NOTIFY_MOVE_TIME);
    }

    function hideTurnIndicators(){
        $user1MovePointer.hide();
        $user2MovePointer.hide();
        clearTimeout(moveTimeOut);
    }

    function showWhoseTurn(){
        toggleDropElement($user1MovePointer);
        toggleDropElement($user2MovePointer);

        $gameArenaContentTurnOverlay.toggle(!isYourTurn);
    }

    function initGameArena(){
        $gameArenaContent.toggleClass(ZERO_TURN_CSS, !isCross).toggleClass(CROSS_TURN_CSS, isCross);
    }

    function showGameArena(){
        $gameListContainer.fadeOut(ANIMATION_SPEED, function(){
            $gameArenaContainer.show();
        });
    }

    function hideGameArenaOverlay(){
        $gameArenaContentOverlay.hide();
        $playAgainBtn.hide();
    }

    function showGameFieldOverlay(message, showPlayAgain){
        $gameArenaContentOverlay.show();
        $gameInfoLbl.text(message);
        $playAgainBtn.toggle(showPlayAgain);
    }

    function hideGameArena(){
        $gameArenaContainer.fadeOut(ANIMATION_SPEED, function(){
            $gameListContainer.show();
        });
    }

    function clearGameArenaContent(){
        $gameArenaContent.find('label').css('transition' , 'none').removeClass(CROSS_CSS)
                                    .removeClass(ZERO_CSS).removeClass(CHECKED_CSS)
                                    .css('transition' , '');
    }

    function log(message, eventName, isSent){
        console.log((eventName ? (isSent ? 'event sent:' : 'event received:') + eventName + ' ' : '') + (message ? message : ''));
    }

    //init ui controls
    $createGameBtn.on('click', createNewGame);
    $leaveGameBtn.on('click', leaveGame);
    $messageTxt.on('keypress', addMessageOnEnterClick);
    $userNameTxt.on('keypress', enterNameOnEnterClick);
    $gameListContent.on('click', 'button', joinGame);
    $gameArenaContent.on('click', 'label', move);
    $playAgainBtn.on('click', playAgain);
    $userNameTxt.select();
    $('[data-toggle="tooltip"]').tooltip();
});