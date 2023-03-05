export default class GameController {
    constructor(gamePlay) {
        this.gamePlay = gamePlay;
        this.mineNumber = 40;
        this.boardSize = 16;
    }

    init() {
        this.clear();
        this.setCallbacks();
        this.gamePlay.drawUi(this.board, this.mineNumber);
    }

    setCallbacks() {
        this.gamePlay.startGameCallback = this.startGame.bind(this);
        this.gamePlay.openCellCallback = this.openCell.bind(this);
        this.gamePlay.clearCallback = this.clear.bind(this);
        this.gamePlay.setFlagCallback = this.setFlag.bind(this);
    }

    clear() {
        this.board = [];
        this.openedCellCount = 0;

        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for(let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = {value:0, isOpen: false};
            }
        }
    }

    startGame(x, y) {
        this.setRandomMinePositions(x, y);
        this.setNumbers();
        return { gameState: 'continues', mineNumber: this.mineNumber };
    }

    setRandomMinePositions(x, y) {
        let cellNumbers = [...Array(this.boardSize ** 2).keys()];
        const startPositionCell = x * this.boardSize + y;
        cellNumbers.splice(startPositionCell, 1);
        
        for(let i = 0; i < this.mineNumber; i++) {
            const randomIndex = Math.floor((Math.random() * cellNumbers.length));
            const randomNumber = cellNumbers[randomIndex];
            cellNumbers.splice(randomIndex, 1);

            let row =  Math.floor(randomNumber / this.boardSize);
            let column = randomNumber % this.boardSize;
            this.board[row][column].value = -1;
        }
    }

    setNumbers() {
        for(let i = 0; i < this.boardSize; i++) {
            for(let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j].value === -1) {
                    if (j - 1 >= 0 && this.board[i][j - 1].value >= 0) {
                        this.board[i][j - 1].value++;
                    }

                    if (j + 1 < this.boardSize && this.board[i][j + 1].value >= 0) {
                        this.board[i][j + 1].value++;
                    }

                    if (i - 1 >= 0 && this.board[i - 1][j].value >= 0) {
                        this.board[i - 1][j].value++;
                    }

                    if (i + 1 < this.boardSize && this.board[i + 1][j].value >= 0) {
                        this.board[i + 1][j].value++;
                    }

                    if (i - 1 >= 0 && j - 1 >= 0 && this.board[i - 1][j - 1].value >= 0) {
                        this.board[i - 1][j - 1].value++;
                    }

                    if (i - 1 >= 0 && j + 1 < this.boardSize && this.board[i - 1][j + 1].value >= 0) {
                        this.board[i - 1][j + 1].value++;
                    }

                    if (i + 1 < this.boardSize && j - 1 >= 0 && this.board[i + 1][j - 1].value >= 0) {
                        this.board[i + 1][j - 1].value++;
                    }

                    if (i + 1 < this.boardSize && j + 1 < this.boardSize && this.board[i + 1][j + 1].value >= 0) {
                        this.board[i + 1][j + 1].value++;
                    }
                }
            }
        }
    }

    openCell(x, y) {
        const result = { gameState: 'continues', openedCells: [] };

        if (this.board[x][y].value === -1) {
            if (!this.board[x][y].isFlagSet) {
                result.gameState = 'loss';
                this.loseGame(x, y, result.openedCells);
            }
        } else {
            this.openCells(x, y, result.openedCells);

            if (this.openedCellCount === this.boardSize ** 2 - this.mineNumber) {
                result.gameState = 'victory';

                result.openedCells = result.openedCells.concat(this.getIsNotOpenedCells());
                
            }
        }

        return result;
    }

    openCells(x, y, openedCells) {
        if (!this.board[x][y].isOpen) {
            if (!this.board[x][y].isFlagSet) {
                openedCells.push({ x, y, state:this.board[x][y].value });
                this.board[x][y].isOpen = !this.board[x][y].isOpen; 
                this.openedCellCount++;   
            }
            
            if (this.board[x][y].value !== 0) {
                return;
            } 
            
            if (y - 1 >= 0 && !openedCells.some(el => el.x === x && el.y === y - 1)) {
                this.openCells(x, y - 1, openedCells);
            }
            if (y + 1 < this.boardSize && !openedCells.some(el => el.x === x && el.y === y + 1)) {
                this.openCells(x, y + 1, openedCells);
            }
            if (x - 1 >= 0 && !openedCells.some(el => el.x === x - 1 && el.y === y)) {
                this.openCells(x - 1, y, openedCells);
            }
            if (x + 1 < this.boardSize && !openedCells.some(el => el.x === x + 1 && el.y === y)) {
                this.openCells(x + 1, y, openedCells);
            }
            if (x - 1 >= 0 && y - 1 >= 0 && !openedCells.some(el => el.x === x - 1 && el.y === y - 1)) {
                this.openCells(x - 1, y - 1, openedCells);
            }
            if (x + 1 < this.boardSize && y - 1 >= 0 && !openedCells.some(el => el.x === x + 1 && el.y === y - 1)) {
                this.openCells(x + 1, y - 1, openedCells);
            }
            if (x - 1 >= 0 && y + 1 < this.boardSize && !openedCells.some(el => el.x === x - 1 && el.y === y + 1)) {
                this.openCells(x - 1, y + 1, openedCells);
            }
            if (x + 1 < this.boardSize && y + 1 < this.boardSize && !openedCells.some(el => el.x === x + 1 && el.y === y + 1)) {
                this.openCells(x + 1, y + 1, openedCells);
            }
        }
    }

    loseGame(x, y, openedCells) {
        openedCells.push({ x, y, state: this.board[x][y].value, firstOpened: true });
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if ((x != i || x == i && y != j) && !this.board[i][j].isFlagSet && this.board[i][j].value === -1) {
                    openedCells.push({ x: i, y: j, state: this.board[i][j].value});
                }
            }
        }
    }

    setFlag(x, y) {
        if (!this.board[x][y].isOpen) {
            this.board[x][y].isFlagSet = true;
            if (!this.board[x][y].flagValue) {
                this.board[x][y].flagValue = 1;
            }
            else {
                this.board[x][y].flagValue++;
                if (this.board[x][y].flagValue > 2) {
                    this.board[x][y].flagValue = 0;
                    this.board[x][y].isFlagSet = false;
                }
            }

            return { isOpen: this.board[x][y].isOpen, isFlagSet: this.board[x][y].isFlagSet, flagValue: this.board[x][y].flagValue};
        }

        return { isFlagSet: false, isOpen: true };
    }

    getIsNotOpenedCells() {
        const result = [];

        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (!this.board[i][j].isOpen) {
                    result.push({ x: i, y: j, state: this.board[i][j].value, isFlagSet: true, flagValue : 1 });
                }
            }
        }

        return result;
    }
}


