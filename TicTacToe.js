/**
 * Created by artem on 15/02/2015.
 */

function TicTacToe(){
    var arr = [new Array(3), new Array(3),new Array(3)],
        xTurn = true,
        movesHistory = [],
        winCombination = [],
        finished = false;

    function gameFinished(){
        return finished;
    }

    function getWinCombination(){
        return winCombination;
    }

    function check(move){
        var hasMatch = false;

        if(finished){
            return true;
        }

        //check vertical
        for(var i = 0; i < 3; i++){
            if(arr[i][move.y] === undefined){
                hasMatch = false;
                break;
            }

            hasMatch = i !== 0 && arr[i][move.y] === arr[i-1][move.y];

            winCombination.push({x: i, y: move.y});
        }

        if(hasMatch){
            finished = true;
            return true;
        }

        winCombination = [];

        //check horizontal
        for(var i = 0; i < 3; i++){
            if(arr[move.x][i] === undefined){
                hasMatch = false;
                break;
            }

            hasMatch = i !== 0 && arr[move.x][i] === arr[move.x][i-1];

            if(hasMatch) {
                winCombination.push({x: move.x, y: i});
            }
        }

        if(hasMatch){
            finished = true;
            return true;
        }

        winCombination = [];

        //check diagonal
        //middle
        if(move.x === 1 && move.y === 1){
            hasMatch = checkDiagonal(true);

            if(!hasMatch){
                winCombination = [];
                hasMatch = checkDiagonal(false);
            }
        }
        else{
            hasMatch = checkDiagonal(move.y === 0);
        }

        if(hasMatch){
            finished = true;
            return true;
        }

        winCombination = [];

        return false;
    };

    function checkDiagonal(isLeft){
        var hasMatch = false,
            prevItem,
            j = 0;

        if(isLeft){
            for(var i = 0; i < 3; i++){
                if(arr[i][j] === undefined){
                    hasMatch = false;
                    break;
                }

                hasMatch = arr[i][j] === prevItem;
                prevItem = arr[i][j];
                winCombination.push({x: i, y: j});
                j++;
            }
        }
        else{
            for(var i = 2; i <= 0; i--){
                if(arr[i][j] === undefined){
                    hasMatch = false;
                    break;
                }

                hasMatch = arr[i][j] === prevItem;
                prevItem = arr[i][j];
                winCombination.push({x: i, y: j});
                j++;
            }
        }

        return hasMatch;
    };

    function isXTurn(){
        return xTurn;
    };

    function move(move){
        if(finished){
            return;
        }

        if(isTie()){
            return;
        }

        if(!isOccupied(move)){
            arr[move.x][move.y] = xTurn ? 1 : 0;
            xTurn = !xTurn;
            movesHistory.push({
                move: move,
                value: arr[move.x][move.y]
            });
        }
    };

    function isTie(){
        return movesHistory.length === 9;
    };

    function isOccupied(move){
        return arr[move.x][move.y] !== undefined;
    };

    function getBoard(){
        return arr;
    };

    this.gameFinished = gameFinished;
    this.getWinCombination = getWinCombination;
    this.isTie = isTie;
    this.isOccupied = isOccupied;
    this.check = check;
    this.move = move;
    this.getBoard = getBoard;
    this.isXTurn = isXTurn;
}

module.exports = TicTacToe;