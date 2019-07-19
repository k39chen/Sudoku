function Board() {
  this._boardEl = document.getElementById('board');
  this._rows = 9;
  this._cols = 9;
  this._activeCell = '1_1';
  this._cells = [];

  this.init = (puzzle) => {
    let cell;
    let cellValue;
    let row;
    let col;
    let rowEl;
    let rowCells;

    // clear the baord first
    this._boardEl.innerHTML = '';

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
      this._boardEl.appendChild(rowEl);
    }
  };

  this.getValues = () => {
    const values = [];
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

  this.do = (type, val) => {
    const cell = this.getActiveCell();
    if (cell.isConstant()) return;

    if (type === '~') {
      cell.annotate(val);
    } else if (type === '=') {
      cell.setValue(val);
    }
  };

  this.remove = () => {
    const cell = this.getActiveCell();
    if (cell.isConstant()) return;
    cell.setValue('');
  };

  this.undo = () => {
  };

  this.redo = () => {
  };

  window.addEventListener('keyup', (ev) => {
    const activeCellParts = this._activeCell.split('_');
    const activeRow = parseInt(activeCellParts[0], 10);
    const activeCol = parseInt(activeCellParts[1], 10);
    const isCapsLockOn = ev.getModifierState('CapsLock');

    console.log(ev.keyCode);

    switch(ev.keyCode) {
      case 37: // left
        this.setActiveCell(activeRow, activeCol - 1);
        break;
      case 39: // right
        this.setActiveCell(activeRow, activeCol + 1);
        break;
      case 38: // up
        this.setActiveCell(activeRow - 1, activeCol);
        break;
      case 40: // down
        this.setActiveCell(activeRow + 1, activeCol);
        break;
      case 8: // backspace
        this.remove()
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
      case 49: // 1
        this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 1);
        break;
      case 50: // 2
        this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 2);
        break;
      case 51: // 3
        this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 3);
        break;
      case 52: // 4
        this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 4);
        break;
      case 53: // 5
        this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 5);
        break;
      case 54: // 6
        this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 6);
        break;
      case 55: // 7
        this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 7);
        break;
      case 56: // 8
        this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 8);
        break;
      case 57: // 9
        this.do(isCapsLockOn || (!isCapsLockOn && ev.shiftKey) ? '~' : '=', 9);
        break;
      default:
        break;
    }
  });
}
