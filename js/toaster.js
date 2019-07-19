function Toaster() {
  this._duration = 5000;
  this._timeout = null;
  this._el = document.getElementById('toaster');

  this._el.addEventListener('click', (ev) => {
    this.close();
  });

  this.open = (state, message) => {
    document.getElementById('toasterMessage').innerHTML = message;
    this._el.style.maxHeight = '64px';

    this._el.setAttribute('data-state', state);

    this._timeout = setTimeout(() => {
      this.close();
    }, this._duration);
  };
  this.close = () => {
    clearTimeout(this._timeout);
    this._timeout = null;
    this._el.style.maxHeight = 0;
  };
}
