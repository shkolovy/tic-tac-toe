/**
 * Created by artem on 15/02/2015.
 */

function Board(){
    var arr = [new Array(3), new Array(3),new Array(3)],
        xTurn = true,
        movesHistory = [];

    function check(move){
        debugger
        var match = false;

        //check vertical
        for(var i = 0; i < 3; i++){
            if(arr[i][move.y] === undefined){
                match = false;
                break;
            }

            match = i !== 0 && arr[i][move.y] === arr[i-1][move.y];
        }

        if(match){
            return true;
        }

        //check horizontal
        for(var i = 0; i < 3; i++){
            if(arr[move.x][i] === undefined){
                match = false;
                break;
            }

            match = i !== 0 && arr[move.x][i] === arr[move.x][i-1];
        }

        if(match){
            return true;
        }

        //not corner
        if(move.x === 1 && move.y === 1){
            return match;
        }

        //check diagonal
        //middle
        if(move.x === 1 && move.y === 1){
            match = checkDiagonal(true);

            if(!match){
                checkDiagonal(false);
            }
        }
        else{
            checkDiagonal(move.y === 0);
        }

        return match;
    };

    function checkDiagonal(isLeft){
        var match = false,
            prevItem,
            j = 0;

        if(isLeft){
            for(var i = 0; i < 3; i++){
                if(arr[i][j] === undefined){
                    match = false;
                    break;
                }

                match = arr[i][j] === prevItem;
                prevItem = arr[i][j];
                j++;
            }
        }
        else{
            for(var i = 2; i <= 0; i--){
                if(arr[i][j] === undefined){
                    match = false;
                    break;
                }

                match = arr[i][j] === prevItem;
                prevItem = arr[i][j];
                j++;
            }
        }

        return match;
    };

    function isXTurn(){
        return xTurn;
    };

    function set(move){
        arr[move.x][move.y] = xTurn ? 1 : 0;
        xTurn = !xTurn;
        movesHistory.push({
            move: move,
            value: arr[move.x][move.y]
        });
    };

    function hasWinner(){

    };

    function hasMoves(){
        return movesHistory.length < 9;
    };

    function isOccupied(move){
        return arr[move.x][move.y] !== undefined;
    };

    function getBoard(){
        return arr;
    };

    this.hasMoves = hasMoves;
    this.isOccupied = isOccupied;
    this.check = check;
    this.set = set;
    this.getBoard = getBoard;
    this.isXTurn = isXTurn;
}

module.exports = Board;