/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/js/gamePlay.js
class GamePlay {
  constructor() {
    this.container = null;
    this.boardEl = null;
    this.gameState = null;
    this.startGameCallback = () => {};
    this.openCellCallback = () => {};
    this.clearCallback = () => {};
    this.setFlagCallback = () => {};
  }
  bindToDOM(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("container is not HTMLElement");
    }
    this.container = container;
  }
  drawUi(board, mineNumber) {
    this.mineNumber = mineNumber;
    this.container.innerHTML += `<div data-id="board" class="board"></div>`;
    this.boardEl = this.container.querySelector("[data-id=board]");
    for (let i = 0; i < board.length; i += 1) {
      const rowEl = document.createElement("div");
      rowEl.classList.add("row");
      rowEl.setAttribute("data-row", i);
      for (let j = 0; j < board[i].length; j += 1) {
        const cellEl = document.createElement("div");
        cellEl.classList.add("cell", "icon");
        cellEl.setAttribute("data-row", i);
        cellEl.setAttribute("data-column", j);
        rowEl.appendChild(cellEl);
        cellEl.addEventListener("click", event => {
          this.onClickCell(event);
        });
        cellEl.addEventListener("mousedown", () => {
          this.gameButtonEl.classList.add("game-button-inprocess");
        });
        cellEl.addEventListener("mouseup", () => {
          this.gameButtonEl.classList.remove("game-button-inprocess");
        });
        cellEl.addEventListener("contextmenu", event => {
          this.onOpenFlag(event);
        });
      }
      this.boardEl.appendChild(rowEl);
    }
    this.gameButtonEl = this.container.querySelector(".game-button");
    this.gameButtonEl.addEventListener("click", () => {
      this.clearCallback();
      this.gameState = null;
      this.drawEmptyMineNumber();
      clearInterval(this.intervalId);
      this.drawEmptyTimer();
      this.removeClassFromElement(this.gameButtonEl, "game-button-");
      this.clearBoard();
    });
  }
  onClickCell(el) {
    const x = Number(el.target.dataset.row);
    const y = Number(el.target.dataset.column);
    if (!this.gameState) {
      const result = this.startGameCallback(x, y);
      this.gameState = "inprocess";
      this.mineNumber = result.mineNumber;
      this.drawMineNumber();
      this.drawTimer();
      this.onOpenCell(x, y);
    } else if (this.gameState === "inprocess") {
      this.onOpenCell(x, y);
    }
  }
  onOpenCell(x, y) {
    const result = this.openCellCallback(x, y);
    result.openedCells.forEach(cell => {
      const cellEl = document.querySelector("[data-row='" + cell.x + "'][data-column='" + cell.y + "']");
      if (cell.state === 0) {
        cellEl.classList.add("cell-none-mine");
      } else if (cell.state > 0) {
        cellEl.classList.add("cell-mine-" + cell.state);
      } else if (cell.isFlagSet) {
        if (cell.flagValue === 1) {
          cellEl.classList.add("cell-flag");
        } else if (cell.flagValue === 2) {
          cellEl.classList.add("cell-question");
        }
      } else if (cell.state === -1) {
        cellEl.classList.add(cell.firstOpened ? "cell-mine-active" : "cell-mine");
      }
    });
    if (result.gameState === "loss") {
      clearInterval(this.intervalId);
      this.gameButtonEl.classList.add("game-button-loss");
      this.gameState = result.gameState;
    } else if (result.gameState === "victory") {
      clearInterval(this.intervalId);
      this.gameButtonEl.classList.add("game-button-victory");
      this.gameState = result.gameState;
    }
  }
  drawEmptyMineNumber() {
    const mineNumberArr = ["0", "0", "0"];
    mineNumberArr.forEach((mineNumberItem, index) => {
      const mineNumberIconEl = this.container.querySelector(".mine-count-icon:nth-child(" + (index + 1) + ")");
      this.removeClassFromElement(mineNumberIconEl, "number-");
      mineNumberIconEl.classList.add("number-" + mineNumberItem);
    });
  }
  drawMineNumber() {
    let mineNumberArr = this.mineNumber.toString().split("");
    if (mineNumberArr.length < 3) {
      let zeroCount = 3 - mineNumberArr.length;
      while (zeroCount > 0) {
        mineNumberArr.unshift("0");
        zeroCount--;
      }
    }
    mineNumberArr.forEach((mineNumberItem, index) => {
      const mineNumberIconEl = this.container.querySelector(".mine-count-icon:nth-child(" + (index + 1) + ")");
      this.removeClassFromElement(mineNumberIconEl, "number-");
      mineNumberIconEl.classList.add("number-" + mineNumberItem);
    });
  }
  drawEmptyTimer() {
    const secondsArr = ["0", "0", "0"];
    secondsArr.forEach((secondsItem, index) => {
      const secondsIconEl = this.container.querySelector(".timer-icon:nth-child(" + (index + 1) + ")");
      this.removeClassFromElement(secondsIconEl, "number-");
      secondsIconEl.classList.add("number-" + secondsItem);
    });
  }
  drawTimer() {
    let seconds = 0;
    this.intervalId = setInterval(() => {
      seconds++;
      let secondsArr = seconds.toString().split("");
      if (secondsArr.length < 3) {
        let zeroCount = 3 - secondsArr.length;
        while (zeroCount > 0) {
          secondsArr.unshift("0");
          zeroCount--;
        }
      }
      secondsArr.forEach((secondsItem, index) => {
        const secondsIconEl = this.container.querySelector(".timer-icon:nth-child(" + (index + 1) + ")");
        this.removeClassFromElement(secondsIconEl, "number-");
        secondsIconEl.classList.add("number-" + secondsItem);
      });
    }, 1000);
  }
  removeClassFromElement(el, className) {
    let classIterator = el.classList.values();
    let iteratorResult = classIterator.next();
    while (iteratorResult) {
      if (iteratorResult.done) {
        break;
      }
      if (iteratorResult.value.includes(className)) {
        el.classList.remove(iteratorResult.value);
        break;
      }
      iteratorResult = classIterator.next();
    }
  }
  clearBoard() {
    const cellEls = Array.from(document.querySelectorAll(".cell"));
    cellEls.forEach(cellEl => {
      this.removeClassFromElement(cellEl, "cell-");
    });
  }
  onOpenFlag(event) {
    event.preventDefault();
    const x = Number(event.target.dataset.row);
    const y = Number(event.target.dataset.column);
    const result = this.setFlagCallback(x, y);
    if (result.isFlagSet) {
      this.removeClassFromElement(event.target, "cell-");
      if (result.flagValue === 1) {
        this.mineNumber--;
        event.target.classList.add("cell-flag");
      } else if (result.flagValue === 2) {
        this.mineNumber++;
        event.target.classList.add("cell-question");
      }
    } else {
      if (!result.isOpen) {
        this.removeClassFromElement(event.target, "cell-");
      }
    }
    this.drawMineNumber();
  }
}
;// CONCATENATED MODULE: ./src/js/gameController.js
class GameController {
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
      for (let j = 0; j < this.boardSize; j++) {
        this.board[i][j] = {
          value: 0,
          isOpen: false
        };
      }
    }
  }
  startGame(x, y) {
    this.setRandomMinePositions(x, y);
    this.setNumbers();
    return {
      gameState: 'continues',
      mineNumber: this.mineNumber
    };
  }
  setRandomMinePositions(x, y) {
    let cellNumbers = [...Array(this.boardSize ** 2).keys()];
    const startPositionCell = x * this.boardSize + y;
    cellNumbers.splice(startPositionCell, 1);
    for (let i = 0; i < this.mineNumber; i++) {
      const randomIndex = Math.floor(Math.random() * cellNumbers.length);
      const randomNumber = cellNumbers[randomIndex];
      cellNumbers.splice(randomIndex, 1);
      let row = Math.floor(randomNumber / this.boardSize);
      let column = randomNumber % this.boardSize;
      this.board[row][column].value = -1;
    }
  }
  setNumbers() {
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
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
    const result = {
      gameState: 'continues',
      openedCells: []
    };
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
        openedCells.push({
          x,
          y,
          state: this.board[x][y].value
        });
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
    openedCells.push({
      x,
      y,
      state: this.board[x][y].value,
      firstOpened: true
    });
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if ((x != i || x == i && y != j) && !this.board[i][j].isFlagSet && this.board[i][j].value === -1) {
          openedCells.push({
            x: i,
            y: j,
            state: this.board[i][j].value
          });
        }
      }
    }
  }
  setFlag(x, y) {
    if (!this.board[x][y].isOpen) {
      this.board[x][y].isFlagSet = true;
      if (!this.board[x][y].flagValue) {
        this.board[x][y].flagValue = 1;
      } else {
        this.board[x][y].flagValue++;
        if (this.board[x][y].flagValue > 2) {
          this.board[x][y].flagValue = 0;
          this.board[x][y].isFlagSet = false;
        }
      }
      return {
        isOpen: this.board[x][y].isOpen,
        isFlagSet: this.board[x][y].isFlagSet,
        flagValue: this.board[x][y].flagValue
      };
    }
    return {
      isFlagSet: false,
      isOpen: true
    };
  }
  getIsNotOpenedCells() {
    const result = [];
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (!this.board[i][j].isOpen) {
          result.push({
            x: i,
            y: j,
            state: this.board[i][j].value,
            isFlagSet: true,
            flagValue: 1
          });
        }
      }
    }
    return result;
  }
}
;// CONCATENATED MODULE: ./src/js/app.js


const gamePlay = new GamePlay();
gamePlay.bindToDOM(document.querySelector("#board-container"));
const gameController = new GameController(gamePlay);
gameController.init();
;// CONCATENATED MODULE: ./src/index.js


/******/ })()
;