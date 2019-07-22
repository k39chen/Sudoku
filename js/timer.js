function Timer() {
  this._interval = null;
  this._elapsedMilliseconds = 0;
  this._pollRate = 1000;
  this._isPaused = false;
  this._el = document.getElementById('timer');

  this.start = () => {
    this._elapsedMilliseconds = 0;
    this._isPaused = false;
    this._el.style.color = '#595959';
    this.updateLabel();

    this._interval = setInterval(() => {
      if (!this._isPaused) {
        this._elapsedMilliseconds += this._pollRate;
        this.updateLabel();
      }
    }, this._pollRate);
  };

  this.stop = () => {
    clearInterval(this._interval);
    this._elapsedMilliseconds = 0;
    this._isPaused = false;
    this._interval = null;
    this.updateLabel();
  };

  this.restart = () => {
    this.stop();
    this.start();
  };

  this.pause = () => {
    this._isPaused = true;
    console.log('Timer paused');
  };

  this.resume = () => {
    this._isPaused = false;
    console.log('Timer resumed');
  };

  this.isPaused = () => {
    return this._isPaused;
  };

  this.getLabel = () => {
    let seconds = this._elapsedMilliseconds / 1000;
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    if (seconds < 10) seconds = '0' + seconds;
    return `${minutes}:${seconds}`;
  };

  this.updateLabel = () => {
    this._el.innerText = this.getLabel();
  }
}
