function Timer() {
  this._interval = null;
  this._elapsedMilliseconds = 0;
  this._pollRate = 1000;
  this._timerEl = document.getElementById('timer');

  this.start = () => {
    this._elapsedMilliseconds = 0;
    this.updateLabel();

    this._interval = setInterval(() => {
      this._elapsedMilliseconds += this._pollRate;
      this.updateLabel();
    }, this._pollRate);
  };
  this.stop = () => {
    clearInterval(this._interval);
    this._elapsedMilliseconds = 0;
    this._interval = null;
    this.updateLabel();
  };
  this.restart = () => {
    this.stop();
    this.start();
  };
  this.getLabel = () => {
    let seconds = this._elapsedMilliseconds / 1000;
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    if (seconds < 10) seconds = '0' + seconds;
    return `${minutes}:${seconds}`;
  };
  this.updateLabel = () => {
    this._timerEl.innerText = this.getLabel();
  }
}
