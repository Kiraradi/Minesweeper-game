export default class GamePlay {
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
        cellEl.addEventListener("click", (event) => {
          this.onClickCell(event);
        });
        cellEl.addEventListener("mousedown", () => {
          this.gameButtonEl.classList.add("game-button-inprocess");
        });
        cellEl.addEventListener("mouseup", () => {
          this.gameButtonEl.classList.remove("game-button-inprocess");
        });
        cellEl.addEventListener("contextmenu", (event) => {
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

    result.openedCells.forEach((cell) => {
      const cellEl = document.querySelector(
        "[data-row='" + cell.x + "'][data-column='" + cell.y + "']"
      );

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
        cellEl.classList.add(
          cell.firstOpened ? "cell-mine-active" : "cell-mine"
        );
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
      const mineNumberIconEl = this.container.querySelector(
        ".mine-count-icon:nth-child(" + (index + 1) + ")"
      );
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
      const mineNumberIconEl = this.container.querySelector(
        ".mine-count-icon:nth-child(" + (index + 1) + ")"
      );
      this.removeClassFromElement(mineNumberIconEl, "number-");
      mineNumberIconEl.classList.add("number-" + mineNumberItem);
    });
  }

  drawEmptyTimer() {
    const secondsArr = ["0", "0", "0"];
    secondsArr.forEach((secondsItem, index) => {
      const secondsIconEl = this.container.querySelector(
        ".timer-icon:nth-child(" + (index + 1) + ")"
      );
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
        const secondsIconEl = this.container.querySelector(
          ".timer-icon:nth-child(" + (index + 1) + ")"
        );
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

    cellEls.forEach((cellEl) => {
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
