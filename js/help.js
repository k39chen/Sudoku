function Help() {
  this._el = document.getElementById('help');

  this.isOpen = () => {
    return this._el.getAttribute('data-state') === 'open';
  };

  this.open = () => {
    this._el.setAttribute('data-state', 'open');
    document.getElementById('container').style.left = '420px';
  };

  this.close = () => {
    this._el.removeAttribute('data-state');
    document.getElementById('container').style.left = '0px';
  };

  document.getElementById('helpCloseButton').addEventListener('click', this.close.bind(this));
}
