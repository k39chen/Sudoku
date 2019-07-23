(function () {
  setTimeout(() => {
    const game = new Game();
    let puzzle;

    if (window.location.search !== '') {
      puzzle = window.location.search.replace('?puzzle=', '');
    }
    game.start(puzzle);
  }, 100);
})();
