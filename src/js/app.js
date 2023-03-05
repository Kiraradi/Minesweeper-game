import GamePlay from "./GamePlay";
import GameController from "./gameController";

const gamePlay = new GamePlay();
gamePlay.bindToDOM(document.querySelector("#board-container"));
const gameController = new GameController(gamePlay);
gameController.init();
