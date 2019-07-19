/*
SCRAPE PUZZLE FROM WEBSUDOKU.COM
e.g. https://www.websudoku.com/?level=2


var inputEls = document.getElementById('puzzle_grid').getElementsByTagName('input');
var puzzle = []; for (var i=0 ;i<inputEls.length; i++) {
  var val = inputEls[i].value;
  puzzle.push(val === '' ? '.' : val);
}
puzzle = puzzle.join('');
*/
function Game() {
  this._difficulty = 'hard';
  this._timer = new Timer();
  this._toaster = new Toaster();
  this._board = new Board();
  this._pane = new Pane(this);

  this._puzzle = null;
  this._solution = null;

  this._toggleButtonEl = document.getElementById('toggleButton');
  this._validateButtonEl = document.getElementById('validateButton');
  this._autoAnnotateButtonEl = document.getElementById('autoAnnotateButton');
  this._resetButtonEl = document.getElementById('resetButton');
  this._solveButtonEl = document.getElementById('solveButton');

  this.start = (puzzle) => {
    if (puzzle !== undefined) {
      this._puzzle = puzzle;
    } else {
      this._puzzle = sudoku.generate(this._difficulty);
    }
    this._solution = sudoku.solve(this._puzzle);
    this._timer.restart();
    this._board.init(this.toMatrix(this._puzzle));
    this._board.setActiveCell(1, 1);
  };

  this.changeDifficulty = (difficulty) => {
    this._difficulty = difficulty;
    this.start();
  };

  this.toMatrix = (b) => {
    b = b.split('');
    const board = [];
    for (let row = 0; row < 9; row++) {
      board.push(b.splice(0, 9));
    }
    return board;
  };

}
