function Pane(game) {
  this._game = game;
  this._el = document.getElementById('pane');

  this.isOpen = () => {
    return this._el.getAttribute('data-state') === 'open';
  };

  this.open = () => {
    this._el.setAttribute('data-state', 'open');
    document.getElementById('container').style.left = '320px';
  };

  this.close = () => {
    this._el.removeAttribute('data-state');
    document.getElementById('container').style.left = '0px';
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

  document.getElementById('togglePauseButton').addEventListener('click', () => this._game.togglePause.bind(this._game)());
  document.getElementById('validateButton').addEventListener('click', () => this._game.validate.bind(this._game)());
  document.getElementById('autoAnnotateButton').addEventListener('click', () => this._game.autoAnnotate.bind(this._game)());
  document.getElementById('resetButton').addEventListener('click', () => this._game.reset.bind(this._game)());
  document.getElementById('solveButton').addEventListener('click', () => this._game.solve.bind(this._game)());

  document.getElementById('styleModeButton').addEventListener('click', () => this._game.toggleStyle.bind(this._game)());

  document.getElementById('settingsCloseButton').addEventListener('click', this.close.bind(this));
}
