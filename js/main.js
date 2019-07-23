(function () {
  setTimeout(() => {
    window.game = new Game();
    let puzzle;

    if (window.location.search !== '') {
      puzzle = window.location.search;
      puzzle = puzzle.slice(1).split('&');
      for (let i = 0; i < puzzle.length; i++) {
        if (puzzle[i].indexOf('puzzle=') === 0) {
          puzzle = puzzle[i].replace('puzzle=', '');
          break;
        }
      }
    }
    if (sudoku.validate_board(puzzle) !== true) {
      puzzle = undefined;
    }
    game.start(puzzle);
  }, 100);
})();
