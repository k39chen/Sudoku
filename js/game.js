/*
SCRAPE PUZZLE FROM WEBSUDOKU.COM
e.g. https://www.websudoku.com/?level=2


var inputEls = document.getElementById('puzzle_grid').getElementsByTagName('input');
var puzzle = []; for (var i=0 ;i<inputEls.length; i++) {
  var val = inputEls[i].value;
  puzzle.push(val === '' ? '.' : val);
}
puzzle = puzzle.join('');


.9..5..6.1......8..4...297536..........327..........386548...2..8......3.3..7..9.

window.location.search
*/
function Game() {
  this._difficulty = 'hard';
  this._timer = new Timer();
  this._toaster = new Toaster();
  this._board = new Board(this);
  this._pane = new Pane(this);
  this._help = new Help();

  this._puzzle = null;
  this._solution = null;

  this._validateButtonEl = document.getElementById('validateButton');
  this._autoAnnotateButtonEl = document.getElementById('autoAnnotateButton');
  this._clearAnnotationsButtonEl = document.getElementById('clearAnnotationsButton');
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

  this.togglePause = () => {
    const togglePauseButton = document.getElementById('togglePauseButton');
    const boardEl = this._board._el;
    const timerEl = this._timer._el;

    if (this._timer.isPaused()) {
      togglePauseButton.innerText = 'Pause'
      this._timer.resume();
      boardEl.style.pointerEvents = 'auto';
      boardEl.style.filter = 'blur(0)';
      timerEl.style.color = '#595959';
    } else {
      togglePauseButton.innerText = 'Resume';
      this._timer.pause();
      boardEl.style.pointerEvents = 'none';
      boardEl.style.filter = 'blur(10px)';
      timerEl.style.color = '#ef8166';
    }
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

  this.isComplete = () => {
    const boardValues = this._board.getValues();
    if (boardValues === this._solution) {
      this._toaster.open('success', `Completed puzzle in ${this._timer.getLabel()}!`);
      this._timer.pause();
      this._timer._el.style.color = '#6eba83';
      return true;
    }
    return false;
  };

  this.autoAnnotate = () => {
    const board = this.toMatrix(this._board.getValues());
    const candidates = JSON.parse(JSON.stringify(board));
    let row;
    let col;
    let index_x;
    let index_y;
    let cellValue;
    let candidate;
    let appearsInRow = false;
    let appearsInCol = false;

    for (row = 0; row < board.length; row++) {
      for (col = 0; col < board[row].length; col++) {
        cellValue = board[row][col];

        if (cellValue === '.') {
          for (candidate = 1; candidate <= 9; candidate++) {
            // check if this candidate number appears in this row
            appearsInRow = false;
            for (index_x = 0; index_x < board[row].length; index_x++) {
              if (board[row][index_x] === candidate.toString()) {
                appearsInRow = true;
                break;
              }
            }
            // check if this candidate number appears in this column
            appearsInCol = false;
            for (index_y = 0; index_y < board.length; index_y++) {
              if (board[index_y][col] === candidate.toString()) {
                appearsInCol = true;
                break;
              }
            }
            // see if this candidate appears in this row, column, or block
            if (!appearsInRow && !appearsInCol) {
              // add candidate
              if (!candidates[row]) candidates[row] = [];
              if (!candidates[row][col] || candidates[row][col] === '.') candidates[row][col] = '';
              candidates[row][col] += candidate;
            }
          }
        }

      }
    }
    this._board.setValues(candidates, true);
  };

  this.clearAnnotations = () => {
    const board = JSON.parse(JSON.stringify(this.toMatrix(this._board.getValues())));
    let row;
    let col;
    let Cell;

    for (row = 0; row < board.length; row++) {
      for (col = 0; col < board[row].length; col++) {
        Cell = this._board.getCell(row + 1, col + 1);
        Cell.removeAnnotations();
      }
    }
  };

  this.reset = () => {
    this._timer.restart();
    this._board.init(this.toMatrix(this._puzzle));
  };

  this.solve = () => {
    this._board.setValues(this.toMatrix(this._solution));
  };

  this.toggleStyle = () => {
    const htmlEl = document.getElementsByTagName('html')[0];
    const styleModeButtonEl = document.getElementById('styleModeButton');
    if (htmlEl.getAttribute('data-style-mode') === 'dark') {
      htmlEl.setAttribute('data-style-mode', 'light');
      styleModeButtonEl.innerText = 'Use Dark Mode';
    } else {
      htmlEl.setAttribute('data-style-mode', 'dark');
      styleModeButtonEl.innerText = 'Use Light Mode';
    }
  };

  this.toMatrix = (b) => {
    b = b.split('');
    const board = [];
    for (let row = 0; row < 9; row++) {
      board.push(b.splice(0, 9));
    }
    return board;
  };

  document.getElementById('settingsButton').addEventListener('click', () => this._pane.open.bind(this._pane)());
  document.getElementById('helpButton').addEventListener('click', () => this._help.open.bind(this._help)());
}
