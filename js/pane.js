function Pane(game, board) {
  this._game = game;
  this._el = document.getElementById('pane');

  this.open = () => {
    this._el.setAttribute('data-state', 'open');
    document.getElementById('container').style.left = '320px';
  };

  this.close = () => {
    this._el.removeAttribute('data-state');
    document.getElementById('container').style.left = '0px';
  };

  this.changeDifficulty = (difficulty) => {
    this._game.changeDifficulty(difficulty);
  };

  this.copyScraper = () => {
    const scraperCode = "var inputEls = document.getElementById('puzzle_grid').getElementsByTagName('input'); var puzzle = []; for (var i=0 ;i<inputEls.length; i++) { var val = inputEls[i].value; puzzle.push(val === '' ? '.' : val) } puzzle = puzzle.join('');";
    this.copyToClipboard(scraperCode);
    this._game._toaster.open('success', 'Copied scraper code to clipboard. Intended for WebSudoku.com');
    console.log('Exported game board', scraperCode);
  };

  this.export = () => {
    const boardValues = this._game._board.getValues();
    this.copyToClipboard(boardValues);
    this._game._toaster.open('success', 'Copied board state to clipboard.');
    console.log('Exported game board', boardValues);
  };

  this.copyToClipboard = (contents) => {
    const clipboardInputEl = document.getElementById('clipboardInput')
    clipboardInputEl.value = contents;
    clipboardInputEl.select();
    document.execCommand('copy');
  };

  this.validate = () => {
    const boardValues = this._game._board.getValues();
    const errors = [];
    let numEmpty = 0;
    let isValid = true;
    let row;
    let col;

    for (let i = 0; i < this._game._solution.length; i++) {
      if (boardValues[i] !== '.' && boardValues[i] !== this._game._solution[i]) {
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
      this._game._toaster.open('success', `Everything is correct so far. ${numEmpty} remaining!`);
    } else {
      this._game._toaster.open('error', `There are problems in the highlighted squares.`);
      this._game._board.showErrors(errors);
    }
    return isValid;
  };

  this.autoAnnotate = () => {
    const boardValues = this._game._board.getValues();
    const candidates = sudoku.get_candidates(boardValues);
    console.log(candidates);
    this._game._board.setValues(candidates, true);
  };

  this.reset = () => {
    this._game._timer.restart();
    this._game._board.init(this._game.toMatrix(this._game._puzzle));
  };

  this.solve = () => {
    this._game._board.setValues(this._game.toMatrix(this._game._solution));
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

  document.getElementById('settingsButton').addEventListener('click', this.open.bind(this));
  document.getElementById('importText').addEventListener('change', (ev) => {
    const puzzle = ev.target.value;
    const isValid = sudoku.validate_board(puzzle);
    if (isValid === true) {
      this._game.start(puzzle);
      this.close();
      this._game._toaster.open('success', 'Successfully loaded puzzle!');
    } else {
      this._game._toaster.open('error', isValid);
    }
  });

  document.getElementById('difficultySelect').addEventListener('change', ev => this.changeDifficulty(ev.target.value));
  document.getElementById('copyScraperButton').addEventListener('click', this.copyScraper.bind(this));
  document.getElementById('exportButton').addEventListener('click', this.export.bind(this));

  document.getElementById('validateButton').addEventListener('click', this.validate.bind(this));
  document.getElementById('autoAnnotateButton').addEventListener('click', this.autoAnnotate.bind(this));
  document.getElementById('resetButton').addEventListener('click', this.reset.bind(this));
  document.getElementById('solveButton').addEventListener('click', this.solve.bind(this));

  document.getElementById('styleModeButton').addEventListener('click', this.toggleStyle.bind(this));

  document.getElementById('settingsCloseButton').addEventListener('click', this.close.bind(this));
}
