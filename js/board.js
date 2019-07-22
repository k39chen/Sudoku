function Board(game) {
  this._game = game;
  this._el = document.getElementById('board');
  this._rows = 9;
  this._cols = 9;
  this._activeCell = '1_1';
  this._activeHighlight = null;
  this._cells = [];

  // this is what we use for managing do/undo
  this._stateIndex = 0;
  this._states = [];

  this.init = (puzzle) => {
    let cell;
    let cellValue;
    let row;
    let col;
    let rowEl;
    let rowCells;

    // clear the baord first
    this._el.innerHTML = '';
    this._states = [];
    this._stateIndex = 0;

    // go through each cell of the puzzle and generate
    // the elements accordingly
    for (row = 0; row < this._rows; row++) {
      rowEl = document.createElement('div');
      rowEl.classList = 'board-row';
      rowEl.setAttribute('data-index', row + 1);
      rowCells = [];

      for (col = 0; col < this._cols; col++) {
        cellValue = puzzle[row][col];
        cell = new Cell(row+ 1, col + 1, cellValue !== '.' ? cellValue : undefined);
        cell.getElement().addEventListener('click', (ev) => {
          this.setActiveCell(
            ev.target.getAttribute('data-row'),
            ev.target.getAttribute('data-col')
          );
        })
        rowEl.appendChild(cell.getElement());
        rowCells[col + 1] = cell;
      }
      this._cells[row + 1] = rowCells;
      this._el.appendChild(rowEl);
    }
  };

  this.getState = () => {
    const values = [];
    let row;
    let col;
    let cell;
    let rowValues;
    for (row = 1; row <= this._rows; row++) {
      rowValues = [];
      for (col = 1; col <= this._cols; col++) {
        cell = this.getCell(row, col);

        if (cell.hasValue()) {
          rowValues.push(cell.getValue().toString());
        } else if (cell.hasAnnotations()) {
          rowValues.push(cell.getAnnotations());
        } else {
          rowValues.push('');
        }
      }
      values.push(rowValues);
    }
    return values;
  };

  this.setState = (state) => {
    let row;
    let col;
    let cell;
    let cellState;

    for (row = 0; row < this._rows; row++) {
      for (col = 0; col < this._cols; col++) {
        cell = this.getCell(row + 1, col + 1);
        cellState = state[row][col];

        if (cell.isConstant()) continue;

        if (typeof cellState === 'object') {
          cell.bulkAnnotate(cellState, true);
        } else {
          cell.setValue(cellState, true);
        }
      }
    }
    this.check();
  };

  this.getValues = () => {
    const values = [];
    let row;
    let col;
    let cell;
    let cellValue;
    for (row = 1; row <= this._rows; row++) {
      for (col = 1; col <= this._cols; col++) {
        cell = this.getCell(row, col);
        cellValue = cell.getValue();
        values.push(cellValue ? cellValue : '.');
      }
    }
    return values.join('');
  };

  this.setValues = (values, forceAnnotate = false) => {
    let row;
    let col;
    let cell;
    let cellValue;
    let i;

    for (row = 0; row < this._rows; row++) {
      for (col = 0; col < this._cols; col++) {
        cell = this.getCell(row + 1, col + 1);
        cellValue = values[row][col];

        if (cell.isConstant()) continue;

        if (cellValue.length > 1) {
          cell.bulkAnnotate(cellValue.split(''));
        } else {
          if (forceAnnotate) {
            cell.annotate(parseInt(cellValue, 10));
          } else {
            cell.setValue(parseInt(cellValue, 10));
          }
        }
      }
    }
    this.check();
  };

  this.showErrors = (errors) => {
    let cell;
    let parts;
    let row;
    let col;
    for (let i = 0; i < errors.length; i++) {
      parts = errors[i].split('_');
      row = parseInt(parts[0], 10);
      col = parseInt(parts[1], 10);
      cell = this.getCell(row, col);
      cell.showError();
    }
  };

  this.getCell = (row, col) => {
    return this._cells[row][col];
  };

  this.getActiveCell = () => {
    const activeCellParts = this._activeCell.split('_'); 
    const activeRow = parseInt(activeCellParts[0], 10);
    const activeCell = parseInt(activeCellParts[1], 10)
    return this._cells[activeRow][activeCell];
  };

  this.setActiveCell = (activeRow, activeCol) => {
    let row;
    let col;
    let cell;
    activeRow = Math.min(Math.max(activeRow, 1), 9);
    activeCol = Math.min(Math.max(activeCol, 1), 9);

    this._activeCell = [activeRow, activeCol].join('_');

    for (row = 1; row <= this._rows; row++) {
      for (col = 1; col <= this._cols; col++) {
        cell = this.getCell(row, col);
        if (row === activeRow && col === activeCol) {
          cell.setActive();
        } else {
          cell.setInactive();
        }
      }
    }
  };

  this.highlightNumber = (value) => {
    let row;
    let col;
    let cell;
    let cellValue;

    this.removeHighlights();

    if (this._activeHighlight === value) {
      this._activeHighlight = null;
      return;
    }
    for (row = 1; row <= this._rows; row++) {
      for (col = 1; col <= this._cols; col++) {
        cell = this.getCell(row, col);
        cellValue = (cell.getValue() || '').toString();

        if (cellValue === value.toString() || cell.hasAnnotation(value)) {
          cell.highlight();
        }
      }
    }
    this._activeHighlight = value;
  };

  this.removeHighlights = () => {
    let row;
    let col;
    let cell;

    for (row = 1; row <= this._rows; row++) {
      for (col = 1; col <= this._cols; col++) {
        cell = this.getCell(row, col);
        cell.unhighlight();
      }
    }
  };

  this.do = (type, val) => {
    const cell = this.getActiveCell();
    if (cell.isConstant()) return;

    if (type === '~') {
      cell.annotate(val);
    } else if (type === '=') {
      cell.setValue(val);
    }

    this._states = this._states.splice(0, this._stateIndex + 1);
    this._states.push(this.getState());
    this._stateIndex = this._states.length - 1;

    console.log('do', this._stateIndex, JSON.parse(JSON.stringify(this._states)));

    this.check();
  };

  this.undo = () => {
    this._stateIndex = Math.max(this._stateIndex - 1, 0);
    const state = this._states[this._stateIndex];

    console.log('undo', this._stateIndex, JSON.parse(JSON.stringify(state)));
    this.setState(state);

    this.check();
  };

  this.redo = () => {
    this._stateIndex = Math.max(this._stateIndex + 1, this._states.length - 1);
    const state = this._states[this._stateIndex];

    console.log('redo', this._stateIndex, JSON.parse(JSON.stringify(this._states)));
    this.setState(state);

    this.check();
  };

  this.check = () => {
    this._game.isComplete();
  };

  window.addEventListener('keyup', (ev) => {
    const activeCellParts = this._activeCell.split('_');
    const activeRow = parseInt(activeCellParts[0], 10);
    const activeCol = parseInt(activeCellParts[1], 10);
    const isCapsLockOn = ev.getModifierState('CapsLock');

    // console.log(ev.keyCode);

    switch(ev.keyCode) {
      case 37: // left
        if (!this._game._timer.isPaused()) {
          this.setActiveCell(activeRow, activeCol - 1);
        }
        break;
      case 39: // right
        if (!this._game._timer.isPaused()) {  
          this.setActiveCell(activeRow, activeCol + 1);
        }
        break;
      case 38: // up
        if (!this._game._timer.isPaused()) {  
          this.setActiveCell(activeRow - 1, activeCol);
        }
        break;
      case 40: // down
        if (!this._game._timer.isPaused()) {  
          this.setActiveCell(activeRow + 1, activeCol);
        }
        break;
      case 8: // backspace
        if (!this._game._timer.isPaused()) {
          this.do('=', '');
        }
        break;
      case 80: // P
        if (ev.ctrlKey) {  
          this._game.togglePause();
        }
        break;
      case 82: // R
        if (ev.ctrlKey) {
          this._game.reset();
        }
        break;
      case 86: // V
        if (ev.ctrlKey) {
          this._game.validate();
        }
        break;
      case 90: // Z
        if (ev.ctrlKey) {
          if (ev.shiftKey) {
            this.redo();
          } else {
            this.undo();
          }
        }
        break;
      case 188: // ,
        if (ev.ctrlKey) {
          if (this._game._pane.isOpen()) {
            this._game._pane.close();
          } else {
            this._game._pane.open();
          }
        }
        break;
      case 49: // 1
        if (ev.ctrlKey) {
          this.highlightNumber(1);
        } else {
          this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 1);
        }
        break;
      case 50: // 2
        if (ev.ctrlKey) {
          this.highlightNumber(2);
        } else {
          this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 2);
        }
        break;
      case 51: // 3
        if (ev.ctrlKey) {
          this.highlightNumber(3);
        } else {
          this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 3);
        }
        break;
      case 52: // 4
        if (ev.ctrlKey) {
          this.highlightNumber(4);
        } else {
          this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 4);
        }
        break;
      case 53: // 5
        if (ev.ctrlKey) {
          this.highlightNumber(5);
        } else {
          this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 5);
        }
        break;
      case 54: // 6
        if (ev.ctrlKey) {
          this.highlightNumber(6);
        } else {
          this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 6);
        }
        break;
      case 55: // 7
        if (ev.ctrlKey) {
          this.highlightNumber(7);
        } else {
          this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 7);
        }
        break;
      case 56: // 8
        if (ev.ctrlKey) {
          this.highlightNumber(8);
        } else {
          this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 8);
        }
        break;
      case 57: // 9
        if (ev.ctrlKey) {
          this.highlightNumber(9);
        } else {
          this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 9);
        }
        break;
      default:
        break;
    }
  });
}
