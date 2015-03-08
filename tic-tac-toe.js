/**
 * Created by artem on 15/02/2015.
 */

function TicTacToe(){
    var arr = [new Array(3), new Array(3),new Array(3)],
        xTurn = true,
        movesHistory = [],
        winCombination = [],
        finished = false,
        minMovesCountToCheck = 5;

    function isGameFinished(){
        return finished;
    }

    function getWinCombination(){
        return winCombination;
    }

    function check(move){
        var hasMatch = false;

        if(finished){
            return;
        }

        if(movesHistory.length < minMovesCountToCheck){
            return;
        }

        //check vertical
        for(var i = 0; i < 3; i++){
            if(arr[i][move.y] === undefined){
                hasMatch = false;
                break;
            }

            if(i !== 0){
                hasMatch = arr[i][move.y] === arr[i-1][move.y];

                if(!hasMatch){
                    break;
                }
            }

            winCombination.push({x: i, y: move.y});
        }

        if(hasMatch){
            finished = true;
            return;
        }

        winCombination = [];

        //check horizontal
        for(var i = 0; i < 3; i++){
            if(arr[move.x][i] === undefined){
                hasMatch = false;
                break;
            }

            if(i !== 0){
                hasMatch = arr[move.x][i] === arr[move.x][i-1];

                if(!hasMatch){
                    break;
                }
            }

            winCombination.push({x: move.x, y: i});
        }

        if(hasMatch){
            finished = true;
            return;
        }

        winCombination = [];

        //check left diagonal
        hasMatch = checkLeftDiagonal();

        if(hasMatch){
            finished = true;
            return;
        }

        winCombination = [];

        //check right diagonal
        hasMatch = checkRightDiagonal();

        if(hasMatch){
            finished = true;
            return;
        }

        winCombination = [];

        return;
    }

    function checkLeftDiagonal(){
        var hasMatch = false,
            j = 0;

        for(var i = 0; i < 3; i++){
            if(arr[i][j] === undefined){
                hasMatch = false;
                break;
            }

            if(i !== 0){
                hasMatch = arr[i][j] === arr[i-1][j-1];

                if(!hasMatch){
                    break;
                }
            }

            winCombination.push({x: i, y: j});
            j++;
        }

        return hasMatch;
    }


    function checkRightDiagonal(){
        var hasMatch = false,
            j = 2;

        for(var i = 0; i < 3; i++){
            if(arr[i][j] === undefined){
                hasMatch = false;
                break;
            }

            if(i !== 0){
                hasMatch = arr[i][j] === arr[i-1][j+1];

                if(!hasMatch){
                    break;
                }
            }

            winCombination.push({x: i, y: j});
            j--;
        }

        return hasMatch;
    }

    function isXTurn(){
        return xTurn;
    }

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

            check(move);
        }
    }

    function isTie(){
        return movesHistory.length === 9;
    }

    function isOccupied(move){
        return arr[move.x][move.y] !== undefined;
    }

    function getBoard(){
        return arr;
    }

    this.isGameFinished = isGameFinished;
    this.getWinCombination = getWinCombination;
    this.isTie = isTie;
    this.isOccupied = isOccupied;
    this.move = move;
    this.getBoard = getBoard;
    this.isXTurn = isXTurn;
}

module.exports = TicTacToe;