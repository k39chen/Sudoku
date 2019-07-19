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

  this._puzzle = null;
  this._solution = null;

  this._toggleButtonEl = document.getElementById('toggleButton');
  this._validateButtonEl = document.getElementById('validateButton');
  this._autoAnnotateButtonEl = document.getElementById('autoAnnotateButton');
  this._resetButtonEl = document.getElementById('resetButton');
  this._solveButtonEl = document.getElementById('solveButton');


  this.start = () => {
    this._puzzle = sudoku.generate(this._difficulty);

    this._puzzle = '..654..8.....8..7...23.9.14..5....37.........86....1..63.1.27...5..3.....2..964..';

    this._solution = sudoku.solve(this._puzzle);
    this._timer.start();
    this._board.init(this.toMatrix(this._puzzle));
    this._board.setActiveCell(1, 1);
  };

  this.validate = () => {
    const boardValues = this._board.getValues();
    const errors = [];
    let numEmpty = 0;
    let isValid = true;
    let row;
    let col;

    for (let i = 0; i < this._solution.length; i++) {
      if (boardValues[i] !== '.' && boardValues[i] !== this._solution[i]) {
        row = Math.floor(i / 9) + 1;
        col = Math.floor(i % 9) + 1;
        errors.push([row, col].join('_'));
        isValid = false;
      }
      if (boardValues[i] === '.') {
        numEmpty++;
      }
    }
    if (isValid) {
      this._toaster.open('success', `Everything is correct so far. ${numEmpty} remaining!`);
    } else {
      this._toaster.open('error', `There are problems in the highlighted squares.`);
      this._board.showErrors(errors);
    }
    return isValid;
  };

  this.autoAnnotate = () => {
    const boardValues = this._board.getValues();
    const candidates = sudoku.get_candidates(boardValues);
    console.log(candidates);
    this._board.setValues(candidates, true);
  };

  this.reset = () => {
    this._timer.restart();
    this._board.init(this.toMatrix(this._puzzle));
  };

  this.solve = () => {
    this._board.setValues(this.toMatrix(this._solution));
  };
  this.toMatrix = (b) => {
    b = b.split('');
    const board = [];
    for (let row = 0; row < 9; row++) {
      board.push(b.splice(0, 9));
    }
    return board;
  };

  this.hasControlButtons = () => {
    return this._validateButtonEl.style.display === 'inline-block';
  };
  this.showControlButtons = () => {
    this._validateButtonEl.style.display = 'inline-block';
    this._autoAnnotateButtonEl.style.display = 'inline-block';
    this._resetButtonEl.style.display = 'inline-block';
    this._solveButtonEl.style.display = 'inline-block';
    this._toggleButtonEl.innerText = 'Hide Controls';
  };
  this.hideControlButtons = () => {
    this._validateButtonEl.style.display = 'none';
    this._autoAnnotateButtonEl.style.display = 'none';
    this._resetButtonEl.style.display = 'none';
    this._solveButtonEl.style.display = 'none';
    this._toggleButtonEl.innerText = 'Show Controls';
  };

  this._toggleButtonEl.addEventListener('click', () => {
    if (this.hasControlButtons()) {
      this.hideControlButtons();
    } else {
      this.showControlButtons();
    }
  });
  document.getElementById('validateButton').addEventListener('click', this.validate.bind(this));
  document.getElementById('autoAnnotateButton').addEventListener('click', this.autoAnnotate.bind(this));
  document.getElementById('resetButton').addEventListener('click', this.reset.bind(this));
  document.getElementById('solveButton').addEventListener('click', this.solve.bind(this));
}
