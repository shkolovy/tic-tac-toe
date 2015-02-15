/**
 * Created by artem on 15/02/2015.
 */

(function(){
    var socket = io.connect(),
        //board = new Board(),
        $moveBtn = $('#moveBtn'),
        $moveXText = $('#moveXText'),
        $moveYText = $('#moveYText'),
        $movesLabel = $('#movesLabel'),
        $boardLabel = $('#boardLabel'),
        $nameLabel = $('#nameLabel');

    var userName = 'none';

    function init(){
        socket.on('show', onShow);
        socket.on('occupied', onOccupied);
        socket.on('winner', onVictory);
        socket.on('draw', onDraw);
        socket.on('waitForUser', waitForUser);

        $moveBtn.on('click', onMoveClick);
        askForName();
        $nameLabel.text(userName);
    };

    function askForName(){
        userName = prompt("Please enter your name", userName);
    };

    function onMoveClick() {
        var m = {
                x: Number($moveXText.val()),
                y: Number($moveYText.val())
            };

        move(m);
    }

    //events
    function waitForUser(){
        alert('wait for users');
    };

    function onOccupied(){
        alert('occupied');
    };

    function onVictory(){
        alert(userName + ' wins!');
    };

    function onDraw(){
        alert('draw!');
    };

    function onShow(data){
        $movesLabel.append('<p>user: ' + data.user + '</br>move: x:' + data.move.x + ', y:' + data.move.y + '</p>');

        $boardLabel.html('');

        console.log(data.board);

        for(var i = 0; i < 3; i++){
            for(var j = 0; j < 3; j++){
                $boardLabel.append(data.board[i][j] === null ? '-' : (data.board[i][j] === 1 ? 'x' : 'o'));
            }

            $boardLabel.append('<br>');
        }
    };

    function move(move){
        socket.emit('move', {
                user: userName,
                move: move
            });
        //if(board.isOccupied(move)){
        //    alert('occupied');
        //    return;
        //}
        //
        //board.set(move);
        //
        //socket.emit('move', {
        //    user: userName,
        //    move: move
        //});
        //
        //if(board.check(move)){
        //    alert(userName + ' wins!');
        //}
        //
        //if(!board.hasMoves()){
        //    alert('draw!');
        //}
    };

    $(init);
}());



